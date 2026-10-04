package com.nexus.jarvis;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final int REQ_AUDIO = 200;
    private NexusView nexusView;
    private TextView status;
    private EditText input;
    private SpeechRecognizer recognizer;
    private TextToSpeech tts;
    private AssistantEngine engine;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        engine = new AssistantEngine(this);
        tts = new TextToSpeech(this, this);
        buildUi();
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA}, REQ_AUDIO);
        }
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(24, 24, 24, 28);
        root.setBackgroundColor(Color.rgb(5, 8, 18));

        nexusView = new NexusView(this);
        root.addView(nexusView, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        status = new TextView(this);
        status.setText("Nexus listo · habla naturalmente");
        status.setTextColor(Color.rgb(190, 240, 255));
        status.setGravity(Gravity.CENTER);
        status.setTextSize(16f);
        root.addView(status, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 58));

        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);

        input = new EditText(this);
        input.setHint("Escribe o usa la voz…");
        input.setHintTextColor(Color.rgb(120, 150, 165));
        input.setTextColor(Color.WHITE);
        input.setSingleLine(false);
        row.addView(input, new LinearLayout.LayoutParams(0, 60, 1f));

        Button mic = new Button(this);
        mic.setText("🎙");
        mic.setOnClickListener(v -> startListening());
        row.addView(mic, new LinearLayout.LayoutParams(72, 60));

        Button send = new Button(this);
        send.setText("ENVIAR");
        send.setOnClickListener(v -> runRequest(input.getText().toString()));
        row.addView(send, new LinearLayout.LayoutParams(100, 60));

        root.addView(row);
        setContentView(root);
    }

    private void startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            say("El reconocimiento de voz no está disponible en este dispositivo.");
            return;
        }
        if (recognizer != null) recognizer.destroy();

        recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) {
                nexusView.setListening(true);
                status.setText("Escuchando…");
            }
            @Override public void onBeginningOfSpeech() {}
            @Override public void onRmsChanged(float rmsdB) {}
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onEndOfSpeech() {
                nexusView.setListening(false);
                status.setText("Procesando…");
                nexusView.setThinking(true);
            }
            @Override public void onError(int error) {
                nexusView.setListening(false);
                nexusView.setThinking(false);
                status.setText("No conseguí una transcripción.");
            }
            @Override public void onResults(Bundle results) {
                nexusView.setThinking(false);
                ArrayList<String> values = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (values != null && !values.isEmpty()) {
                    input.setText(values.get(0));
                    runRequest(values.get(0));
                }
            }
            @Override public void onPartialResults(Bundle partialResults) {}
            @Override public void onEvent(int eventType, Bundle params) {}
        });

        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-ES");
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "es-ES");
        i.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        i.putExtra(RecognizerIntent.EXTRA_PROMPT, "Habla con Nexus");
        recognizer.startListening(i);
    }

    private void runRequest(String text) {
        if (text == null || text.trim().isEmpty()) return;
        nexusView.setThinking(true);
        status.setText("Nexus · procesando");
        String response = engine.handle(text);
        nexusView.setThinking(false);
        status.setText(response);
        say(response);
    }

    private void say(String text) {
        if (tts != null) {
            tts.setLanguage(new Locale("es", "ES"));
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "nexus");
        }
    }

    @Override public void onInit(int statusCode) {
        if (statusCode == TextToSpeech.SUCCESS && tts != null) {
            tts.setLanguage(new Locale("es", "ES"));
        }
    }

    @Override protected void onDestroy() {
        if (recognizer != null) recognizer.destroy();
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
