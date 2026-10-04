package com.nexus.jarvis;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.view.View;

public class NexusView extends View {
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private float pulse = 0f;
    private boolean listening = false;
    private boolean thinking = false;
    private ValueAnimator animator;

    public NexusView(Context context) {
        super(context);
        paint.setStrokeWidth(3f);
        setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        startAnimation();
    }

    private void startAnimation() {
        animator = ValueAnimator.ofFloat(0f, 1f);
        animator.setDuration(2600);
        animator.setRepeatCount(ValueAnimator.INFINITE);
        animator.addUpdateListener(a -> {
            pulse = (float)a.getAnimatedValue();
            invalidate();
        });
        animator.start();
    }

    public void setListening(boolean value) {
        listening = value;
        invalidate();
    }

    public void setThinking(boolean value) {
        thinking = value;
        invalidate();
    }

    @Override protected void onDraw(Canvas c) {
        super.onDraw(c);
        float cx = getWidth()/2f;
        float cy = getHeight()/2.05f;
        float base = Math.min(getWidth(), getHeight()) * 0.27f;
        float wave = (float)Math.sin(pulse * Math.PI * 2);
        float p = (wave + 1f) / 2f;

        paint.setStyle(Paint.Style.FILL);
        paint.setShader(new RadialGradient(cx, cy, base*1.55f,
                new int[]{0xAA8FEAFF,0x3378D8FF,0x0078D8FF},
                new float[]{0f,0.55f,1f}, Shader.TileMode.CLAMP));
        c.drawCircle(cx, cy, base*1.55f + p*18f, paint);
        paint.setShader(null);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(4f);
        paint.setShadowLayer(22f, 0f, 0f, 0xCC76E7FF);
        paint.setColor(0xFFB8F4FF);
        c.drawCircle(cx, cy, base*(1.08f + 0.03f*p), paint);
        paint.clearShadowLayer();

        paint.setStrokeWidth(2.4f);
        paint.setColor(0x667FE7FF);
        c.drawCircle(cx, cy, base*1.28f + 16f*p, paint);
        c.drawCircle(cx, cy, base*1.48f + 28f*(1f-p), paint);

        paint.setStyle(Paint.Style.FILL);
        paint.setShader(new RadialGradient(cx, cy, base*0.92f,
                new int[]{0xFFFFFFFF,0xFFDDFBFF,0xFF76CFF8,0xFF14364F},
                new float[]{0f,0.14f,0.54f,1f}, Shader.TileMode.CLAMP));
        c.drawCircle(cx, cy, base*0.92f, paint);
        paint.setShader(null);

        paint.setColor(0xCC07101B);
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTextSize(Math.max(14f, base*0.13f));
        c.drawText(listening ? "ESCUCHANDO" : thinking ? "PENSANDO" : "NEXUS", cx, cy + base*1.45f, paint);
    }
}
