package com.nexus.jarvis;

import android.content.Context;
import android.content.Intent;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.net.Uri;
import android.provider.AlarmClock;
import android.provider.MediaStore;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class AssistantEngine {
    private final Context context;

    public AssistantEngine(Context context) {
        this.context = context;
    }

    public String handle(String raw) {
        if (raw == null) return "No te escuché.";
        String q = raw.trim().toLowerCase(Locale.ROOT);

        if (q.contains("hora") || q.contains("qué hora")) {
            return "Ahora son las " + new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()) + ".";
        }

        if (q.contains("linterna") || q.contains("flash")) {
            try {
                CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
                for (String id : cm.getCameraIdList()) {
                    Boolean flash = cm.getCameraCharacteristics(id).get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                    Integer facing = cm.getCameraCharacteristics(id).get(CameraCharacteristics.LENS_FACING);
                    if (Boolean.TRUE.equals(flash) && facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                        cm.setTorchMode(id, true);
                        return "Linterna encendida.";
                    }
                }
            } catch (Exception ignored) {}
            return "No pude activar la linterna en este dispositivo.";
        }

        if (q.contains("apaga la linterna") || q.contains("apagar la linterna") || q.contains("apaga el flash")) {
            try {
                CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
                for (String id : cm.getCameraIdList()) {
                    Boolean flash = cm.getCameraCharacteristics(id).get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                    if (Boolean.TRUE.equals(flash)) cm.setTorchMode(id, false);
                }
                return "Linterna apagada.";
            } catch (Exception ignored) {}
            return "No pude apagar la linterna.";
        }

        if (q.contains("abre la cámara") || q.contains("abrir cámara") || q.equals("cámara")) {
            try {
                Intent i = new Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(i);
                return "Abriendo la cámara.";
            } catch (Exception ignored) {
                return "No pude abrir la cámara.";
            }
        }

        if (q.contains("temporizador") || q.contains("temporizador de")) {
            int minutes = extractNumber(q);
            if (minutes > 0) {
                Intent i = new Intent(AlarmClock.ACTION_SET_TIMER);
                i.putExtra(AlarmClock.EXTRA_LENGTH, minutes * 60);
                i.putExtra(AlarmClock.EXTRA_SKIP_UI, false);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(i);
                return "Temporizador de " + minutes + " minutos listo para confirmar.";
            }
        }

        if (q.startsWith("busca ") || q.startsWith("buscar ")) {
            String term = q.replaceFirst("^(busca|buscar)\\s+", "").trim();
            if (!term.isEmpty()) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=" + Uri.encode(term)));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(i);
                    return "He abierto una búsqueda para " + term + ".";
                } catch (Exception ignored) {}
            }
        }

        if (q.contains("envía un mensaje") || q.contains("manda un mensaje") || q.contains("envia un mensaje")) {
            return "Puedo preparar el mensaje, pero antes necesito tu confirmación.";
        }

        return "Entendido. Esa solicitud queda preparada para la capa inteligente de Nexus.";
    }

    private int extractNumber(String q) {
        String[] words = q.split("\\s+");
        for (String w : words) {
            try {
                return Integer.parseInt(w.replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        return 0;
    }
}
