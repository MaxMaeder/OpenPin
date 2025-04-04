import android.content.Context
import android.media.*
import android.util.Log
import org.openpin.appframework.media.AudioSource
import org.openpin.appframework.media.soundplayer.SoundPlayerConfig
import java.io.Closeable

class SoundPlayer(
    private val context: Context,
    private val config: SoundPlayerConfig
) : Closeable, AudioSource {

    private var currentVolume: Float = 1.0f

    // Create AudioAttributes explicitly for sonification
    private val audioAttributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()

    private val soundPool: SoundPool = SoundPool.Builder()
        .setAudioAttributes(audioAttributes)
        .setMaxStreams(config.maxStreams)
        .build()

    // Preload the sounds using the keys from the configuration.
    private val soundMap: MutableMap<String, Int> = mutableMapOf()

    init {
        // Request transient audio focus so that our short sounds can play immediately.
        requestAudioFocus()

        soundPool.setOnLoadCompleteListener { _, sampleId, status ->
            if (status != 0) {
                Log.e("SoundPlayer", "Failed to load sound id: $sampleId")
            }
        }

        config.soundResources.forEach { (key, resId) ->
            soundMap[key] = soundPool.load(context, resId, 1)
        }
    }

    /**
     * Requests audio focus for short, transient sound effects.
     */
    private fun requestAudioFocus() {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
            .setOnAudioFocusChangeListener { }
            .build()
        val result = audioManager.requestAudioFocus(focusRequest)
        Log.d("SoundPlayer", "Audio focus request result: $result")
    }

    /**
     * Sets the volume level for the SoundPlayer.
     */
    override fun setVolume(volume: Float) {
        currentVolume = volume.coerceIn(0.0f, 1.0f)
    }

    /**
     * Plays the preloaded sound effect corresponding to the provided key using the current volume.
     * Returns the stream ID so that the caller can later stop the sound if needed.
     */
    fun play(key: String): Int {
        soundMap[key]?.let { soundId ->
            return soundPool.play(soundId, currentVolume, currentVolume, 1, 0, 1.0f)
        }
        return 0
    }

    /**
     * Stops the sound corresponding to the provided stream ID.
     */
    fun stop(streamId: Int) {
        soundPool.stop(streamId)
    }

    /**
     * Releases the SoundPool resources.
     */
    override fun close() {
        soundPool.release()
    }
}
