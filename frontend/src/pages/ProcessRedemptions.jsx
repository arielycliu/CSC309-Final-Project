import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Gift, QrCode, X, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import '../styles/ProcessRedemptions.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const ProcessRedemptions = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [transactionInfo, setTransactionInfo] = useState(null);
    const html5QrCodeRef = useRef(null);
    const fileInputRef = useRef(null);

    const startScanning = () => {
        setScanning(true);
        const elementId = "qr-reader";
        const element = document.getElementById(elementId);
        if (!element) {
            toast.error('Scanner element not found. Please try again.');
            setScanning(false);
            return;
        }

        const html5QrCode = new Html5Qrcode(elementId);
        html5QrCodeRef.current = html5QrCode;

        html5QrCode.start(
            { facingMode: "environment" }, // rear camera
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
                const scannedTransactionId = decodeTransactionId(decodedText);
                setTransactionId(scannedTransactionId);
                fetchTransactionInfo(scannedTransactionId);
                stopScanning();
                toast.success('QR code scanned successfully!');
            },
            (errorMessage) => {
                console.log(errorMessage);
            }
        ).catch((err) => {
            toast.error('Failed to start camera. Please check permissions.');
            setScanning(false);
        });
    };

    const stopScanning = () => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
                html5QrCodeRef.current.clear(); // clear viewfinder ui
                html5QrCodeRef.current = null;
                setScanning(false);
            }).catch((err) => {
                console.error('Error stopping scanner:', err);
                setScanning(false);
            });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        try {
            const html5QrCode = new Html5Qrcode();
            const decodedText = await html5QrCode.scanFile(file, false);
            const scannedTransactionId = decodeTransactionId(decodedText);
            setTransactionId(scannedTransactionId);
            fetchTransactionInfo(scannedTransactionId);
            toast.success('QR code scanned successfully from image!');
        } catch (error) {
            console.error('Error scanning file:', error);
            toast.error('Failed to scan QR code from image. Please ensure the image contains a valid QR code.');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };


    const decodeTransactionId = (encodedText) => {
        try {
            // base64
            const decoded = atob(encodedText.trim());
            if (/^\d+$/.test(decoded)) { // validate is number
                return decoded;
            }
            throw new Error('Error decoding QR code text');
        } catch (error) {
            toast.error('Error decoding QR code text');
            return encodedText.trim();
        }
    };

    const fetchTransactionInfo = async (txId) => {
        try {
            const response = await fetch(`${API_BASE}/transactions/${txId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setTransactionInfo(data);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Transaction not found');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch transaction info');
            setTransactionInfo(null);
        }
    };

    const handleTransactionIdChange = (e) => {
        const value = e.target.value;
        setTransactionId(value);
        if (value) {
            fetchTransactionInfo(value);
        } else {
            setTransactionInfo(null);
        }
    };

    const handleProcess = async () => {
        if (!transactionId) {
            toast.error('Please enter or scan a transaction ID');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/transactions/${transactionId}/processed`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ processed: true }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to process redemption');
            }

            const result = await response.json();
            toast.success(`Redemption processed successfully! ${result.redeemed} points redeemed for ${result.utorid}.`);
            
            setTransactionId('');
            setTransactionInfo(null);
        } catch (error) {
            toast.error(error.message || 'Failed to process redemption');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    return (
        <div className="process-redemptions-page">
            <div className="page-header">
                <h2>Process Redemptions</h2>
                <p>Scan or enter a redemption transaction ID to process it</p>
            </div>

            <div className="process-form-container">
                <div className="process-form">
                    <div className="form-group">
                        <label htmlFor="transactionId">
                            <Gift size={18} />
                            Transaction ID *
                        </label>
                        <div className="transaction-id-input-container">
                            <input
                                type="text"
                                id="transactionId"
                                name="transactionId"
                                value={transactionId}
                                onChange={handleTransactionIdChange}
                                placeholder="Enter transaction ID or scan QR code"
                                className="transaction-id-input"
                            />
                            {/* <label htmlFor="file-upload" className="upload-btn">
                                <Upload size={18} />
                                <input
                                    type="file"
                                    id="file-upload"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </label> */}
                            <button
                                type="button"
                                onClick={scanning ? stopScanning : startScanning}
                                className={`scan-btn ${scanning ? 'scan-btn-active' : ''}`}
                            >
                                {scanning ? <X size={18} /> : <QrCode size={18} />}
                                {scanning ? 'Stop' : 'Scan'}
                            </button>
                        </div>
                    </div>

                    <div className={`qr-scanner-container ${scanning ? 'qr-scanner-visible' : 'qr-scanner-hidden'}`}>
                        <div id="qr-reader" className="qr-reader"></div>
                        {scanning && (
                            <p className="qr-scanner-instruction">
                                Point your camera at the redemption QR code
                            </p>
                        )}
                    </div>

                    {transactionInfo && (
                        transactionInfo.type !== 'redemption' ? (
                            <div className="transaction-info transaction-invalid">
                                <div className="transaction-info-header">
                                    <AlertCircle size={20} className="status-icon invalid" />
                                    <h3>Invalid Transaction</h3>
                                </div>
                                <div className="transaction-details">
                                    <p className="invalid-message">
                                        This transaction is not a redemption transaction. Only redemption transactions can be processed.
                                    </p>
                                    <div className="detail-row">
                                        <span className="detail-label">Transaction ID:</span>
                                        <span className="detail-value">{transactionInfo.id}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`transaction-info ${transactionInfo.processedBy ? 'transaction-processed' : 'transaction-pending'}`}>
                                <div className="transaction-info-header">
                                    {transactionInfo.processedBy ? (
                                        <CheckCircle size={20} className="status-icon processed" />
                                    ) : (
                                        <Clock size={20} className="status-icon pending" />
                                    )}
                                    <h3>
                                        {transactionInfo.processedBy ? 'Already Processed' : 'Pending Redemption'}
                                    </h3>
                                </div>
                                <div className="transaction-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Transaction ID:</span>
                                        <span className="detail-value">{transactionInfo.id}</span>
                                    </div>
                                    {!transactionInfo.processedBy && (
                                        <>
                                            <div className="detail-row">
                                                <span className="detail-label">User UTORid:</span>
                                                <span className="detail-value">{transactionInfo.utorid || 'N/A'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Points to Redeem:</span>
                                                <span className="detail-value">{transactionInfo.redeemed || Math.abs(transactionInfo.amount || 0)}</span>
                                            </div>
                                            {transactionInfo.remark && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Remark:</span>
                                                    <span className="detail-value">{transactionInfo.remark}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setTransactionId('');
                                setTransactionInfo(null);
                            }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className="submit-btn"
                            onClick={handleProcess}
                            disabled={loading || !transactionInfo || transactionInfo.processedBy || transactionInfo.type !== 'redemption'}
                        >
                            {loading ? 'Processing...' : 'Process Redemption'}
                        </button>
                    </div>
                </div>

                <div className="info-panel">
                    <h3>Processing Info</h3>
                    <div className="info-item">
                        <strong>How it works:</strong>
                        <p>Scan the customer's redemption QR code or enter the transaction ID</p>
                        <p>Review the transaction details</p>
                        <p>Click "Process Redemption" to complete the transaction</p>
                    </div>
                    <div className="info-item">
                        <strong>QR Code Scanning:</strong>
                        <p>Click the "Scan" button to open your camera</p>
                        <p>Point your camera at the customer's redemption QR code</p>
                        <p>Or click the upload button to select an image file containing the QR code</p>
                        <p>The transaction ID will be automatically filled in</p>
                    </div>
                    <div className="info-item">
                        <strong>Requirements:</strong>
                        <p>Transaction must be of type "redemption"</p>
                        <p>Transaction must not already be processed</p>
                        <p>Customer must have sufficient points (already verified when request was created)</p>
                    </div>
                    <div className="info-item">
                        <strong>After Processing:</strong>
                        <p>Points will be deducted from the customer's account</p>
                        <p>The transaction will be marked as processed</p>
                        <p>You will be recorded as the processor</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessRedemptions;

