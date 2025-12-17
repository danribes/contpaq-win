"""
T012.2.1 - Test for image preprocessing

Tests for image preprocessing capabilities to improve OCR accuracy
on scanned PDFs, including deskewing, contrast enhancement, and noise reduction.

TDD: RED phase - tests written before implementation
"""

import pytest
from pathlib import Path
from PIL import Image
import numpy as np

# Import will fail initially (RED phase)
from src.services.image_preprocessor import ImagePreprocessor


class TestImagePreprocessing:
    """Tests for image preprocessing to improve OCR quality."""

    @pytest.fixture
    def preprocessor(self):
        """Create an ImagePreprocessor instance for testing."""
        return ImagePreprocessor()

    @pytest.fixture
    def sample_image(self) -> Image.Image:
        """Create a simple test image."""
        # Create a white image with some black text-like elements
        img = Image.new("RGB", (800, 600), color="white")
        return img

    @pytest.fixture
    def rotated_image(self) -> Image.Image:
        """Create an image with simulated rotation/skew."""
        # Create a simple image that we can detect skew on
        img = Image.new("RGB", (800, 600), color="white")
        # We'll rely on the implementation to handle real skewed images
        return img

    @pytest.fixture
    def low_contrast_image(self) -> Image.Image:
        """Create a low contrast test image with some variation."""
        # Create an image with low contrast (narrow range of values)
        np.random.seed(42)
        # Values between 120-140 (low contrast)
        data = np.random.randint(120, 140, (600, 800, 3), dtype=np.uint8)
        img = Image.fromarray(data, mode="RGB")
        return img

    @pytest.fixture
    def noisy_image(self) -> Image.Image:
        """Create a noisy test image."""
        # Create an image with noise
        np.random.seed(42)
        noise = np.random.randint(200, 256, (600, 800, 3), dtype=np.uint8)
        img = Image.fromarray(noise, mode="RGB")
        return img

    # ========================================================================
    # T012.2.2 - Deskewing Tests
    # ========================================================================

    def test_deskew_returns_image(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """deskew should return a PIL Image object."""
        result = preprocessor.deskew(sample_image)
        assert isinstance(result, Image.Image)

    def test_deskew_preserves_mode(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """deskew should preserve the image mode (RGB/L)."""
        result = preprocessor.deskew(sample_image)
        assert result.mode == sample_image.mode

    def test_deskew_accepts_grayscale(
        self, preprocessor: ImagePreprocessor
    ):
        """deskew should work with grayscale images."""
        gray_img = Image.new("L", (800, 600), color=255)
        result = preprocessor.deskew(gray_img)
        assert isinstance(result, Image.Image)

    def test_detect_skew_angle_returns_float(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """detect_skew_angle should return a float angle."""
        angle = preprocessor.detect_skew_angle(sample_image)
        assert isinstance(angle, float)

    def test_detect_skew_angle_within_range(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """Detected skew angle should be within reasonable range (-45 to 45)."""
        angle = preprocessor.detect_skew_angle(sample_image)
        assert -45 <= angle <= 45

    # ========================================================================
    # T012.2.3 - Contrast Enhancement Tests
    # ========================================================================

    def test_enhance_contrast_returns_image(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """enhance_contrast should return a PIL Image object."""
        result = preprocessor.enhance_contrast(sample_image)
        assert isinstance(result, Image.Image)

    def test_enhance_contrast_preserves_size(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """enhance_contrast should preserve image dimensions."""
        result = preprocessor.enhance_contrast(sample_image)
        assert result.size == sample_image.size

    def test_enhance_contrast_increases_dynamic_range(
        self, preprocessor: ImagePreprocessor, low_contrast_image: Image.Image
    ):
        """enhance_contrast should increase the dynamic range of pixel values."""
        result = preprocessor.enhance_contrast(low_contrast_image)

        # Convert to numpy for analysis
        original_arr = np.array(low_contrast_image)
        result_arr = np.array(result)

        # The enhanced image should have a wider range of values
        original_range = original_arr.max() - original_arr.min()
        result_range = result_arr.max() - result_arr.min()

        # Enhanced should have equal or greater range
        assert result_range >= original_range

    def test_enhance_contrast_accepts_factor(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """enhance_contrast should accept a contrast factor parameter."""
        result = preprocessor.enhance_contrast(sample_image, factor=1.5)
        assert isinstance(result, Image.Image)

    def test_enhance_contrast_factor_affects_output(
        self, preprocessor: ImagePreprocessor, low_contrast_image: Image.Image
    ):
        """Different contrast factors should produce different results."""
        result_low = preprocessor.enhance_contrast(low_contrast_image, factor=1.2)
        result_high = preprocessor.enhance_contrast(low_contrast_image, factor=2.0)

        # The two results should be different
        arr_low = np.array(result_low)
        arr_high = np.array(result_high)

        # They shouldn't be identical
        assert not np.array_equal(arr_low, arr_high)

    # ========================================================================
    # T012.2.4 - Noise Reduction Tests
    # ========================================================================

    def test_reduce_noise_returns_image(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """reduce_noise should return a PIL Image object."""
        result = preprocessor.reduce_noise(sample_image)
        assert isinstance(result, Image.Image)

    def test_reduce_noise_preserves_size(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """reduce_noise should preserve image dimensions."""
        result = preprocessor.reduce_noise(sample_image)
        assert result.size == sample_image.size

    def test_reduce_noise_smooths_image(
        self, preprocessor: ImagePreprocessor, noisy_image: Image.Image
    ):
        """reduce_noise should reduce pixel variation in noisy images."""
        result = preprocessor.reduce_noise(noisy_image)

        # Convert to numpy for analysis
        original_arr = np.array(noisy_image).astype(float)
        result_arr = np.array(result).astype(float)

        # Calculate standard deviation (measure of noise)
        original_std = np.std(original_arr)
        result_std = np.std(result_arr)

        # Noise reduction should decrease standard deviation
        assert result_std <= original_std

    def test_reduce_noise_accepts_strength(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """reduce_noise should accept a strength parameter."""
        result = preprocessor.reduce_noise(sample_image, strength=3)
        assert isinstance(result, Image.Image)

    # ========================================================================
    # Combined Pipeline Tests
    # ========================================================================

    def test_preprocess_applies_all_steps(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """preprocess should apply deskew, contrast, and noise reduction."""
        result = preprocessor.preprocess(sample_image)
        assert isinstance(result, Image.Image)

    def test_preprocess_accepts_options(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """preprocess should accept configuration options."""
        result = preprocessor.preprocess(
            sample_image,
            deskew=True,
            enhance_contrast=True,
            reduce_noise=True
        )
        assert isinstance(result, Image.Image)

    def test_preprocess_can_skip_steps(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """preprocess should allow skipping individual steps."""
        # Only apply noise reduction
        result = preprocessor.preprocess(
            sample_image,
            deskew=False,
            enhance_contrast=False,
            reduce_noise=True
        )
        assert isinstance(result, Image.Image)

    def test_preprocess_preserves_mode(
        self, preprocessor: ImagePreprocessor, sample_image: Image.Image
    ):
        """preprocess pipeline should preserve original image mode."""
        result = preprocessor.preprocess(sample_image)
        assert result.mode == sample_image.mode

    # ========================================================================
    # Edge Cases
    # ========================================================================

    def test_handles_small_images(
        self, preprocessor: ImagePreprocessor
    ):
        """Should handle very small images without errors."""
        small_img = Image.new("RGB", (50, 50), color="white")
        result = preprocessor.preprocess(small_img)
        assert isinstance(result, Image.Image)

    def test_handles_large_images(
        self, preprocessor: ImagePreprocessor
    ):
        """Should handle large images without errors."""
        large_img = Image.new("RGB", (3000, 4000), color="white")
        result = preprocessor.preprocess(large_img)
        assert isinstance(result, Image.Image)

    def test_handles_grayscale_images(
        self, preprocessor: ImagePreprocessor
    ):
        """Should handle grayscale images correctly."""
        gray_img = Image.new("L", (800, 600), color=200)
        result = preprocessor.preprocess(gray_img)
        assert isinstance(result, Image.Image)
