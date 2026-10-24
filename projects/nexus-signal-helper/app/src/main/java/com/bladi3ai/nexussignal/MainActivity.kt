package com.bladi3ai.nexussignal

import android.app.Activity
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.net.URL
import java.util.concurrent.Executors

class MainActivity : Activity() {
    private lateinit var connectivityManager: ConnectivityManager
    private lateinit var statusView: TextView
    private lateinit var testView: TextView
    private lateinit var checkButton: Button
    private val worker = Executors.newSingleThreadExecutor()
    private var lastReport = "Todavía no se ha ejecutado ninguna prueba."

    private val targets = listOf(
        "Cloudflare" to "https://www.cloudflare.com/cdn-cgi/trace",
        "Google connectivity" to "https://www.google.com/generate_204"
    )

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) = refreshNetworkStatus()
        override fun onLost(network: Network) = refreshNetworkStatus()
        override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) =
            refreshNetworkStatus()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        buildScreen()
        refreshNetworkStatus()
        try {
            connectivityManager.registerDefaultNetworkCallback(networkCallback)
        } catch (_: RuntimeException) {
            statusView.text = "Android no permitió consultar el estado actual de la red."
        }
    }

    private fun buildScreen() {
        val background = 0xFF0B1020.toInt()
        val panel = 0xFF151D30.toInt()
        val lightText = 0xFFF0F4FF.toInt()
        val mutedText = 0xFFB7C2D8.toInt()
        val accent = 0xFFFFC857.toInt()

        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(24), dp(20), dp(24))
            setBackgroundColor(background)
        }

        content.addView(TextView(this).apply {
            text = "NEXUS SIGNAL HELPER"
            textSize = 23f
            setTextColor(accent)
            gravity = Gravity.CENTER_HORIZONTAL
        }, matchWrap())

        content.addView(TextView(this).apply {
            text = "Recuperación de conexión · TCL 605"
            textSize = 14f
            setTextColor(mutedText)
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(0, dp(8), 0, dp(18))
        }, matchWrap())

        content.addView(sectionTitle("ESTADO DE LA RED", lightText))
        statusView = TextView(this).apply {
            textSize = 15f
            setTextColor(lightText)
            setPadding(dp(14), dp(14), dp(14), dp(14))
            setBackgroundColor(panel)
        }
        content.addView(statusView, matchWrap())

        checkButton = makeButton("COMPROBAR CONEXIÓN", accent) { runTests() }
        content.addView(checkButton, buttonParams())
        content.addView(
            makeButton("RECUPERAR CONEXIÓN", 0xFF39C6A5.toInt()) { showRecoveryDialog() },
            buttonParams()
        )
        content.addView(
            makeButton("CONFIGURAR ARK / PLAY GAMES", 0xFF89A8FF.toInt()) { showAppSettingsDialog() },
            buttonParams()
        )
        content.addView(
            makeButton("COPIAR INFORME", 0xFF8CA6D8.toInt()) { copyReport() },
            buttonParams()
        )

        content.addView(sectionTitle("RESULTADO", lightText))
        testView = TextView(this).apply {
            text = "La prueba consulta dos destinos HTTPS cuando la inicies. No queda ejecutándose en segundo plano."
            textSize = 14f
            setTextColor(mutedText)
            setPadding(dp(14), dp(14), dp(14), dp(14))
            setBackgroundColor(panel)
        }
        content.addView(testView, matchWrap())

        content.addView(TextView(this).apply {
            text = "Nexus no puede aumentar físicamente la potencia de la antena. Android tampoco permite que una app normal apague y encienda los datos móviles por sí sola. Este asistente facilita la recuperación mediante los ajustes del sistema y comprueba el resultado."
            textSize = 12f
            setTextColor(mutedText)
            setPadding(0, dp(18), 0, 0)
        }, matchWrap())

        val scroll = ScrollView(this).apply {
            setBackgroundColor(background)
            addView(content, ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ))
        }
        setContentView(scroll)
    }

    private fun sectionTitle(value: String, color: Int) = TextView(this).apply {
        text = value
        textSize = 13f
        setTextColor(color)
        setPadding(0, dp(20), 0, dp(8))
    }

    private fun makeButton(label: String, color: Int, action: () -> Unit) = Button(this).apply {
        text = label
        isAllCaps = false
        textSize = 15f
        setTextColor(0xFF101521.toInt())
        setBackgroundColor(color)
        setOnClickListener { action() }
    }

    private fun matchWrap() = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    )

    private fun buttonParams() = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    ).apply {
        topMargin = dp(10)
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    private fun refreshNetworkStatus() {
        runOnUiThread {
            val network = connectivityManager.activeNetwork
            val caps = network?.let { connectivityManager.getNetworkCapabilities(it) }
            statusView.text = when {
                network == null || caps == null ->
                    "Red activa: no detectada\nInternet validado por Android: no"
                else -> {
                    val transport = when {
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Datos móviles"
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "Wi-Fi"
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
                        else -> "Otra conexión"
                    }
                    val validated = if (
                        caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
                    ) "Sí" else "No confirmado"
                    "$transport\nInternet validado por Android: $validated"
                }
            }
        }
    }

    private fun runTests() {
        checkButton.isEnabled = false
        testView.text = "Comprobando dos destinos…"
        worker.execute {
            val lines = mutableListOf<String>()
            for ((name, address) in targets) {
                val start = System.nanoTime()
                var connection: HttpURLConnection? = null
                try {
                    connection = URL(address).openConnection() as HttpURLConnection
                    connection.connectTimeout = 3000
                    connection.readTimeout = 3000
                    connection.requestMethod = "GET"
                    connection.setRequestProperty("Cache-Control", "no-cache")
                    connection.instanceFollowRedirects = true
                    val code = connection.responseCode
                    val elapsed = (System.nanoTime() - start) / 1_000_000
                    val result = if (code in 200..399) "RESPONDE (HTTP $code)" else "HTTP $code"
                    lines += "$name: $result · ${elapsed} ms"
                } catch (e: Exception) {
                    val elapsed = (System.nanoTime() - start) / 1_000_000
                    val reason = when (e) {
                        is SocketTimeoutException -> "tiempo agotado"
                        is UnknownHostException -> "no resuelve el dominio"
                        else -> e.javaClass.simpleName
                    }
                    lines += "$name: FALLO ($reason) · ${elapsed} ms"
                } finally {
                    connection?.disconnect()
                }
            }
            val report = lines.joinToString("\n")
            runOnUiThread {
                lastReport = "Estado Android: ${statusView.text}\n$report"
                testView.text = report +
                    "\n\nSi falla solo un destino, podría ser ese destino o su ruta. Si ambos responden y ARK falla, hay que investigar el login, el servidor o la conexión del juego."
                checkButton.isEnabled = true
                refreshNetworkStatus()
            }
        }
    }


    private fun showAppSettingsDialog() {
        AlertDialog.Builder(this)
            .setTitle("Evitar restricciones a ARK")
            .setMessage(
                "Este ajuste solo ayuda si Android está limitando la actividad en segundo plano; no aumenta la señal LTE. En la lista de aplicaciones, abre ARK Mobile 2.0 y Google Play Games. Si estas opciones existen, permite datos en segundo plano y pon el uso de batería en «Sin restricciones» durante la prueba. No borres datos ni desinstales nada."
            )
            .setPositiveButton("Abrir ajustes de aplicaciones") { _, _ ->
                startActivity(Intent(Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS))
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun showRecoveryDialog() {
        AlertDialog.Builder(this)
            .setTitle("Recuperar datos móviles")
            .setMessage(
                "Android no permite que una app normal reinicie los datos por sí sola. Nexus abrirá el panel del sistema. Si estás usando datos móviles y la conexión está fallando, prueba una sola vez: desconecta los datos, espera unos 10 segundos y vuelve a conectarlos. Espera otros 10 segundos y pulsa «Comprobar conexión». No repitas el ciclo continuamente."
            )
            .setPositiveButton("Abrir ajustes de Internet") { _, _ ->
                try {
                    startActivity(Intent(Settings.Panel.ACTION_INTERNET_CONNECTIVITY))
                } catch (_: ActivityNotFoundException) {
                    startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS))
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun copyReport() {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("Nexus Signal Helper", lastReport))
        AlertDialog.Builder(this)
            .setMessage("Informe copiado. Puedes pegarlo para compartir los resultados.")
            .setPositiveButton("Aceptar", null)
            .show()
    }

    override fun onDestroy() {
        try {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        } catch (_: RuntimeException) {
        }
        worker.shutdownNow()
        super.onDestroy()
    }
}
