import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow CORS for Next.js and Express
CORS(app)

OPENFDA_API_URL = "https://api.fda.gov/drug/label.json"
REQUEST_TIMEOUT = 5  # seconds

# Curated fallback medicine catalog if OpenFDA is unavailable or times out
FALLBACK_MEDICINES = [
    {
        "brand_name": "Paracetamol (Crocin)",
        "generic_name": "Acetaminophen",
        "purpose": "Analgesic and antipyretic for relief of mild-to-moderate pain and fever reduction.",
        "warnings": "Do not exceed recommended dose. Severe liver damage may occur if daily limit is exceeded."
    },
    {
        "brand_name": "Amoxicillin",
        "generic_name": "Amoxicillin Trihydrate",
        "purpose": "Broad-spectrum penicillin-class antibiotic for bacterial infections.",
        "warnings": "Contraindicated in patients with penicillin allergy. Complete full prescribed course."
    },
    {
        "brand_name": "Cetirizine (Zyrtec)",
        "generic_name": "Cetirizine Hydrochloride",
        "purpose": "Antihistamine for relief of allergic rhinitis, sneezing, itchy eyes, and hives.",
        "warnings": "May cause drowsiness. Avoid alcohol and operating heavy machinery."
    },
    {
        "brand_name": "Metformin",
        "generic_name": "Metformin Hydrochloride",
        "purpose": "Biguanide antidiabetic for type 2 diabetes blood glucose management.",
        "warnings": "Take with meals to minimize gastrointestinal discomfort. Monitor renal function."
    },
    {
        "brand_name": "Pantoprazole (Pantocid)",
        "generic_name": "Pantoprazole Sodium",
        "purpose": "Proton pump inhibitor (PPI) reducing stomach acid production for GERD and gastritis.",
        "warnings": "Take 30 minutes before morning meals. Long-term use requires medical supervision."
    },
    {
        "brand_name": "Azithromycin (Azithral)",
        "generic_name": "Azithromycin",
        "purpose": "Macrolide antibiotic for respiratory tract infections and sinusitis.",
        "warnings": "Take once daily as directed. Report severe diarrhea or irregular heartbeat."
    }
]

@app.route('/api/medicine/search', methods=['GET'])
def search_medicine():
    query = request.args.get('name', '').strip()
    if not query:
        return jsonify({
            "success": False,
            "message": "Medicine name query parameter is required"
        }), 400

    try:
        # Search OpenFDA with strict timeout
        params = {
            "search": f"openfda.brand_name:{query}*",
            "limit": 5
        }
        response = requests.get(OPENFDA_API_URL, params=params, timeout=REQUEST_TIMEOUT)

        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get('results', []):
                brand_name = item.get('openfda', {}).get('brand_name', ['Unknown'])[0]
                generic_name = item.get('openfda', {}).get('generic_name', ['Unknown'])[0]
                purpose = item.get('purpose', ['No purpose listed'])[0]
                warnings = item.get('warnings', ['No warnings listed'])[0]

                results.append({
                    "brand_name": brand_name,
                    "generic_name": generic_name,
                    "purpose": purpose[:250] + '...' if len(purpose) > 250 else purpose,
                    "warnings": warnings[:250] + '...' if len(warnings) > 250 else warnings,
                    "source": "OpenFDA"
                })

            if results:
                return jsonify({"success": True, "data": results})

        # Fallback to local curated search if OpenFDA returned 404 or no match
        matched_fallback = [
            m for m in FALLBACK_MEDICINES
            if query.lower() in m['brand_name'].lower() or query.lower() in m['generic_name'].lower()
        ]
        if matched_fallback:
            return jsonify({"success": True, "data": matched_fallback, "source": "Curated Cache"})

        return jsonify({
            "success": False,
            "message": f"No drug labels found matching '{query}'"
        }), 404

    except requests.exceptions.Timeout:
        # OpenFDA timed out: fallback to matching local cache
        matched_fallback = [
            m for m in FALLBACK_MEDICINES
            if query.lower() in m['brand_name'].lower() or query.lower() in m['generic_name'].lower()
        ]
        if matched_fallback:
            return jsonify({"success": True, "data": matched_fallback, "source": "Curated Cache (Timeout Fallback)"})

        return jsonify({
            "success": False,
            "message": "OpenFDA API request timed out. Please try again."
        }), 504

    except requests.exceptions.RequestException as e:
        # Network issue or rate limited
        matched_fallback = [
            m for m in FALLBACK_MEDICINES
            if query.lower() in m['brand_name'].lower() or query.lower() in m['generic_name'].lower()
        ]
        if matched_fallback:
            return jsonify({"success": True, "data": matched_fallback, "source": "Curated Cache (Network Fallback)"})

        return jsonify({
            "success": False,
            "message": "Medicine catalog service temporarily unavailable"
        }), 503

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Internal microservice error: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "medicine-lookup-microservice",
        "version": "1.0.0"
    }), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "service": "Medicine Lookup Microservice",
        "status": "running",
        "endpoints": ["/health", "/api/medicine/search?name=crocin"]
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", os.environ.get("FLASK_PORT", 8001)))
    debug_mode = os.environ.get("NODE_ENV") != "production"
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
