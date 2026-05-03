package com.example.motionvideocreator

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.bumptech.glide.Glide
import com.example.motionvideocreator.data.FestivalItem
import com.example.motionvideocreator.data.FestivalRepository
import com.example.motionvideocreator.data.ThemeItem
import com.example.motionvideocreator.data.ThemeRepository
import com.example.motionvideocreator.service.VideoGeneratorService
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var spinnerFestival: Spinner
    private lateinit var gridThemes: LinearLayout
    private lateinit var imageUploadArea: FrameLayout
    private lateinit var uploadedImage: ImageView
    private lateinit var uploadHint: LinearLayout
    private lateinit var editPrompt: TextInputEditText
    private lateinit var btnGenerate: MaterialButton

    private lateinit var videoGenerator: VideoGeneratorService
    private var selectedFestival: FestivalItem? = null
    private var selectedTheme: ThemeItem? = null
    private var imagePath: String? = null
    private var currentPhotoPath: String? = null

    private val REQUEST_IMAGE_CAPTURE = 1
    private val REQUEST_PICK_IMAGE = 2
    private val REQUEST_PERMISSIONS = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        videoGenerator = VideoGeneratorService(this)

        setupViews()
        setupFestivalSpinner()
        setupThemeGrid()
        setupImageUpload()
        setupGenerateButton()

        requestPermissions()
    }

    private fun setupViews() {
        spinnerFestival = findViewById(R.id.spinner_festival)
        gridThemes = findViewById(R.id.grid_themes)
        imageUploadArea = findViewById(R.id.image_upload_area)
        uploadedImage = findViewById(R.id.uploaded_image)
        uploadHint = findViewById(R.id.upload_hint)
        editPrompt = findViewById(R.id.edit_prompt)
        btnGenerate = findViewById(R.id.btn_generate)

        findViewById<MaterialButton>(R.id.btn_take_photo).setOnClickListener { takePhoto() }
        findViewById<MaterialButton>(R.id.btn_select_gallery).setOnClickListener { selectFromGallery() }
    }

    private fun setupFestivalSpinner() {
        val festivals = FestivalRepository.festivals
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, festivals.map { "${it.icon} ${it.name}" })
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerFestival.adapter = adapter

        val defaultFestival = FestivalRepository.getDefaultFestival()
        val defaultPosition = festivals.indexOfFirst { it.id == defaultFestival.id }
        spinnerFestival.setSelection(defaultPosition)
        selectedFestival = defaultFestival

        spinnerFestival.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedFestival = festivals[position]
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun setupThemeGrid() {
        val themes = ThemeRepository.themes
        themes.forEachIndexed { index, theme ->
            val cardView = MaterialCardView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    0,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    1f
                ).apply {
                    marginEnd = 8
                    marginBottom = 8
                    width = 0
                }
                radius = 12f
                elevation = 4f
                setCardBackgroundColor(Color.parseColor(theme.color))
                isClickable = true
                isFocusable = true
                tag = theme

                if (index == 0) {
                    strokeWidth = 4
                    strokeColor = Color.BLACK
                    selectedTheme = theme
                }
            }

            val textView = TextView(this).apply {
                text = theme.name
                textSize = 14f
                setTextColor(Color.WHITE)
                padding = 12
                textAlignment = View.TEXT_ALIGNMENT_CENTER
            }

            cardView.addView(textView)
            cardView.setOnClickListener { onThemeSelected(cardView, theme) }
            gridThemes.addView(cardView)
        }
    }

    private fun onThemeSelected(cardView: MaterialCardView, theme: ThemeItem) {
        gridThemes.children.forEach { child ->
            if (child is MaterialCardView) {
                child.strokeWidth = 0
            }
        }

        cardView.strokeWidth = 4
        cardView.strokeColor = Color.BLACK
        selectedTheme = theme
    }

    private fun setupImageUpload() {
        imageUploadArea.setOnClickListener {
            if (imagePath.isNullOrEmpty()) {
                showImageSourceDialog()
            }
        }
    }

    private fun showImageSourceDialog() {
        val options = arrayOf("拍照", "从相册选择")
        MaterialAlertDialogBuilder(this)
            .setTitle("选择图片来源")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> takePhoto()
                    1 -> selectFromGallery()
                }
            }
            .show()
    }

    private fun takePhoto() {
        Intent(MediaStore.ACTION_IMAGE_CAPTURE).also { takePictureIntent ->
            takePictureIntent.resolveActivity(packageManager)?.also {
                val photoFile: File? = try {
                    createImageFile()
                } catch (ex: IOException) {
                    null
                }
                photoFile?.also {
                    val photoURI: Uri = FileProvider.getUriForFile(
                        this,
                        "com.example.motionvideocreator.fileprovider",
                        it
                    )
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
                    startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE)
                }
            }
        }
    }

    private fun selectFromGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        startActivityForResult(intent, REQUEST_PICK_IMAGE)
    }

    private fun createImageFile(): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir: File? = getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES)
        return File.createTempFile(
            "JPEG_${timeStamp}_",
            ".jpg",
            storageDir
        ).apply {
            currentPhotoPath = absolutePath
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK) {
            when (requestCode) {
                REQUEST_IMAGE_CAPTURE -> {
                    currentPhotoPath?.let {
                        imagePath = it
                        showUploadedImage(it)
                    }
                }
                REQUEST_PICK_IMAGE -> {
                    data?.data?.let { uri ->
                        imagePath = getRealPathFromURI(uri)
                        imagePath?.let { showUploadedImage(it) }
                    }
                }
            }
        }
    }

    private fun getRealPathFromURI(uri: Uri): String? {
        val projection = arrayOf(MediaStore.Images.Media.DATA)
        val cursor = contentResolver.query(uri, projection, null, null, null)
        return cursor?.use {
            val columnIndex = it.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
            it.moveToFirst()
            it.getString(columnIndex)
        }
    }

    private fun showUploadedImage(path: String) {
        Glide.with(this)
            .load(File(path))
            .into(uploadedImage)
        uploadedImage.visibility = View.VISIBLE
        uploadHint.visibility = View.GONE
    }

    private fun setupGenerateButton() {
        btnGenerate.setOnClickListener {
            validateAndGenerate()
        }
    }

    private fun validateAndGenerate() {
        when {
            selectedTheme == null -> {
                showToast(getString(R.string.please_select_theme))
                return
            }
            imagePath.isNullOrEmpty() -> {
                showToast(getString(R.string.please_upload_image))
                return
            }
            editPrompt.text.isNullOrEmpty() -> {
                showToast(getString(R.string.please_enter_prompt))
                return
            }
            else -> {
                generateVideo()
            }
        }
    }

    private fun generateVideo() {
        btnGenerate.isEnabled = false
        btnGenerate.text = getString(R.string.video_generating)

        videoGenerator.generateVideo(
            imagePath!!,
            selectedFestival!!,
            selectedTheme!!,
            editPrompt.text.toString()
        ) { videoPath, error ->
            runOnUiThread {
                btnGenerate.isEnabled = true
                btnGenerate.text = getString(R.string.generate_video)

                if (error != null) {
                    showToast(getString(R.string.error_generate_video))
                    Log.e("VideoGenerator", "Error: $error")
                } else {
                    videoPath?.let {
                        showToast(getString(R.string.video_completed))
                        navigateToPreview(it)
                    }
                }
            }
        }
    }

    private fun navigateToPreview(videoPath: String) {
        val intent = Intent(this, VideoPreviewActivity::class.java)
        intent.putExtra("videoPath", videoPath)
        startActivity(intent)
    }

    private fun requestPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )

        val deniedPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (deniedPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, deniedPermissions.toTypedArray(), REQUEST_PERMISSIONS)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_PERMISSIONS) {
            grantResults.forEach {
                if (it != PackageManager.PERMISSION_GRANTED) {
                    showToast("需要授予权限才能使用所有功能")
                }
            }
        }
    }

    private fun showToast(message: String) {
        android.widget.Toast.makeText(this, message, android.widget.Toast.LENGTH_SHORT).show()
    }
}