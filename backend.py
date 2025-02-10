from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_csv():
    file = request.files['file']
    df = pd.read_csv(file)

    # Simulated ML logic (flagging patients for dietitian referral)
    df['Needs Dietitian'] = df['Some Column'].apply(lambda x: 'Yes' if x > 50 else 'No')

    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(port=5000)
