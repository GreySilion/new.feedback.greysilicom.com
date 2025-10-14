<?php
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelHigh;
use Endroid\QrCode\Exception\GenerateImageException;

/**
 * Generates a QR code image for a given restaurant or school.
 *
 * @param int|string $entityId   Unique ID or code of the restaurant/school.
 * @param string $entityName     Name of the restaurant.
 * @param string $baseUrl        Base URL that the QR should point to.
 * @param string $saveDir        Directory to store generated QR images.
 * @return array                 ['success'=>bool, 'filePath'=>string, 'url'=>string, 'message'=>string]
 */
function generateQrCode($entityId, $entityName, $baseUrl, $saveDir = __DIR__ . '/qr-codes')
{
    try {
        if (empty($entityId) || empty($entityName) || empty($baseUrl)) {
            return ['success' => false, 'filePath' => null, 'url' => null, 'message' => 'Missing required parameters: entityId, entityName, or baseUrl.'];
        }
        if (!filter_var($baseUrl, FILTER_VALIDATE_URL)) {
            return ['success' => false, 'filePath' => null, 'url' => null, 'message' => 'Invalid baseUrl format.'];
        }

        // Ensure save directory exists
        if (!is_dir($saveDir)) {
            mkdir($saveDir, 0775, true);
        }

        // Sanitize and prepare
        $slug = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($entityName));
        $filename = "qr_{$slug}_{$entityId}.png";
        $filePath = rtrim($saveDir, '/') . '/' . $filename;

        // Data to encode (URL)
        $dataUrl = rtrim($baseUrl, '/') . "/review.php?code=" . urlencode($entityId);

        // Build QR code
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($dataUrl)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(new ErrorCorrectionLevelHigh())
            ->size(300)
            ->margin(10)
            ->build();

        // Save to file
        $result->saveToFile($filePath);

        // Return public URL (assuming /qr-codes is web accessible)
        $publicUrl = str_replace($_SERVER['DOCUMENT_ROOT'], '', $filePath);
        $baseDomain = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://{$_SERVER['HTTP_HOST']}";
        $publicUrl = $baseDomain . $publicUrl;

        return [
            'success' => true,
            'filePath' => $filePath,
            'url' => $publicUrl,
            'message' => 'QR generated successfully.'
        ];
    } catch (GenerateImageException $e) {
        return ['success' => false, 'message' => 'QR generation failed: ' . $e->getMessage()];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Unexpected error: ' . $e->getMessage()];
    }
}