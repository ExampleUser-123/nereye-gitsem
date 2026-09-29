package com.nereyegitsem.app;

import android.os.Bundle;
import android.os.SystemClock;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        long splashStartedAt = SystemClock.elapsedRealtime();
        splashScreen.setKeepOnScreenCondition(
            () -> SystemClock.elapsedRealtime() - splashStartedAt < 1400
        );
        super.onCreate(savedInstanceState);
    }
}
