from flask import Flask, request
import whisper_timestamped as whisper
import json

app = Flask(__name__)

@app.route('/v1/audio/transcriptions', methods=['POST'])
def hello():

    # get form data - url encoded
    file = request.form.get('file')

    # get model, fallback to "base"
    model_size = request.form.get('model', 'base')

    # if file is not given, return in json format
    if not file:
        return json.dumps({"error": "File parameter is required"}, indent = 2, ensure_ascii = False)
    
    # help(whisper_timestamped.transcribe)
    audio = whisper.load_audio(file)

    model = whisper.load_model(model_size, device="cpu")

    result = whisper.transcribe(model, audio, language="en")

    return result

