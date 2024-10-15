Const fetch, { FormData, fileFrom } =require('node-fetch');

const payload = {
  "functions": null,
  "variables": null,
  "text_prompt": "Excited about the new innovations that AI will bring to medical research. With gooey.AI workflows, medical students will have quick summaries of all the literature reviews without any LLM hallucinations. ",
  "tts_provider": "OPEN_AI",
  "uberduck_voice_name": "the-rock",
  "uberduck_speaking_rate": 1,
  "google_voice_name": "en-AU-Neural2-C",
  "google_speaking_rate": 0.8,
  "google_pitch": -5.25,
  "bark_history_prompt": null,
  "elevenlabs_voice_name": null,
  "elevenlabs_api_key": null,
  "elevenlabs_voice_id": "ODq5zmih8GrVes37Dizd",
  "elevenlabs_model": "eleven_multilingual_v2",
  "elevenlabs_stability": 0.5,
  "elevenlabs_similarity_boost": 0.75,
  "elevenlabs_style": 0.3,
  "elevenlabs_speaker_boost": true,
  "azure_voice_name": null,
  "openai_voice_name": "nova",
  "openai_tts_model": "tts_1",
  "ghana_nlp_tts_language": null,
  "face_padding_top": 0,
  "face_padding_bottom": 12,
  "face_padding_left": 0,
  "face_padding_right": 2,
  "sadtalker_settings": null,
  "selected_model": "Wav2Lip"
};

async function gooeyAPI() {
  const formData = new FormData();
  formData.set('json', JSON.stringify(payload));
  formData.append('input_face', await fileFrom('1080pexport.mov'));

  const response = await fetch("https://api.gooey.ai/v3/LipsyncTTS/async/form/", {
    method: "POST",
    headers: {
      "Authorization": "bearer " + "sk-Sxizt8hzHJ8nvtfMXwnusNWc20PF7yNVr6LDswGzfeiKpK9t",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(response.status);
  }

  const status_url = response.headers.get("Location");
  while (true) {
    const response = await fetch(status_url, {
        method: "GET",
        headers: {
          "Authorization": "bearer " + "sk-Sxizt8hzHJ8nvtfMXwnusNWc20PF7yNVr6LDswGzfeiKpK9t",
        },
    });
    if (!response.ok) {
        throw new Error(response.status);
    }

    const result = await response.json();
    if (result.status === "completed") {
        console.log(response.status, result);
        break;
    } else if (result.status === "failed") {
        console.log(response.status, result);
        break;
    } else {
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

gooeyAPI();
