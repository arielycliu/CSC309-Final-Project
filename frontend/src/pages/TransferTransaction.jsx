import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, User, DollarSign, FileText, QrCode, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/TransferTransaction.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const TransferTransaction = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const { userId: urlUserId } = useParams();
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [showMyQR, setShowMyQR] = useState(false);
    const [recipientInfo, setRecipientInfo] = useState(null);
    const html5QrCodeRef = useRef(null);
    const [formData, setFormData] = useState({
        userId: '',
        amount: '',
        remark: '',
    });

    useEffect(() => {
        if (urlUserId) {
            setFormData(prev => ({ ...prev, userId: urlUserId }));
            fetchRecipientInfo(urlUserId);
        }
    }, [urlUserId]);

    const fetchRecipientInfo = async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const userData = await response.json();
                setRecipientInfo(userData);
            }
        } catch (error) {
            console.error('Failed to fetch recipient info:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'userId' && value) {
            fetchRecipientInfo(value);
        } else if (name === 'userId' && !value) {
            setRecipientInfo(null);
        }
    };

    const startScanning = () => {
        setScanning(true);
        // wait for the DOM element to be rendered, otherwise doesn't load
        setTimeout(() => {
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
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    const scannedUserId = decodedText.trim();
                    setFormData(prev => ({ ...prev, userId: scannedUserId }));
                    fetchRecipientInfo(scannedUserId);
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
        }, 100);
    };

    const stopScanning = () => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
                html5QrCodeRef.current.clear();
                html5QrCodeRef.current = null;
                setScanning(false);
            }).catch((err) => {
                console.error('Error stopping scanner:', err);
                setScanning(false);
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.userId) {
                throw new Error('Recipient user ID is required');
            }

            const pointAmount = parseInt(formData.amount, 10);

            if (pointAmount <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            
            const requestBody = {
                type: 'transfer',
                amount: pointAmount,
                remark: formData.remark.trim() || undefined,
            };

            const response = await fetch(`${API_BASE}/users/${formData.userId}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create transfer transaction');
            }

            const result = await response.json();
            toast.success(`Transfer successful! Sent ${pointAmount} points to ${result.recipient || recipientInfo?.name || 'recipient'}.`);
            
            setFormData({
                userId: '',
                amount: '',
                remark: '',
            });
            setRecipientInfo(null);
        } catch (error) {
            toast.error(error.message || 'Failed to create transfer');
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
        <div className="transfer-transaction-page">
            <div className="page-header">
                <div className="page-header-content">
                    <div>
                        <h2>Transfer Points</h2>
                        <p>Send points to another user</p>
                    </div>
                    <button
                        onClick={() => setShowMyQR(!showMyQR)}
                        className={`show-qr-btn ${showMyQR ? 'show-qr-btn-active' : ''}`}
                    >
                        <QrCode size={18} />
                        {showMyQR ? 'Hide My QR' : 'Show My QR'}
                    </button>
                </div>
            </div>

            {showMyQR && user?.id && (
                <div className="my-qr-container">
                    <h3>My QR Code</h3>
                    <p className="my-qr-description">
                        Let others scan this QR code so they can transfer points to you
                    </p>
                    <div className="qr-code-wrapper">
                        <QRCodeSVG 
                            value={user.id.toString()} 
                            size={256}
                            level="M"
                        />
                    </div>
                    <p className="my-qr-user-id">
                        User ID: <strong>{user.id}</strong>
                    </p>
                    {user.name && (
                        <p className="my-qr-user-name">
                            Name: <strong>{user.name}</strong>
                        </p>
                    )}
                </div>
            )}

            <div className="transaction-form-container">
                <form onSubmit={handleSubmit} className="transaction-form">
                    <div className='transaction-form-wrapper'>
                        <div className="form-group">
                            <label htmlFor="userId">
                                <User size={18} />
                                Recipient User ID *
                            </label>
                            <div className="user-id-input-container">
                                <input
                                    type="text"
                                    id="userId"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    placeholder="Enter recipient user ID or scan QR code"
                                    required
                                    className="user-id-input"
                                />
                                <button
                                    type="button"
                                    onClick={scanning ? stopScanning : startScanning}
                                    className={`scan-btn ${scanning ? 'scan-btn-active' : ''}`}
                                >
                                    {scanning ? <X size={18} /> : <QrCode size={18} />}
                                    {scanning ? 'Stop' : 'Scan'}
                                </button>
                            </div>
                            {recipientInfo && (
                                <div className="recipient-info">
                                    <strong>{recipientInfo.name || 'User'}</strong>
                                    {recipientInfo.utorid && <p className="recipient-utorid">UTORid: {recipientInfo.utorid}</p>}
                                </div>
                            )}
                            <small>Enter the user ID of the recipient or scan their QR code</small>
                        </div>

                        <div className={`qr-scanner-container ${scanning ? 'qr-scanner-visible' : 'qr-scanner-hidden'}`}>
                            <div id="qr-reader" className="qr-reader"></div>
                            {scanning && (
                                <p className="qr-scanner-instruction">
                                    Point your camera at the QR code
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount">
                                <DollarSign size={18} />
                                Points to Transfer *
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0"
                                min="1"
                                step="1"
                                required
                            />
                            <small>Number of points to transfer (must be a positive integer)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="remark">
                                <FileText size={18} />
                                Remark (Optional)
                            </label>
                            <textarea
                                id="remark"
                                name="remark"
                                value={formData.remark}
                                onChange={handleChange}
                                placeholder="Add any additional notes..."
                                rows="3"
                            />
                            <small>Optional message or reason for the transfer</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/transactions')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Transferring...' : 'Transfer Points'}
                        </button>
                    </div>
                </form>

                <div className="info-panel">
                    <h3>Transfer Info</h3>
                    <div className="info-item">
                        <strong>How it works:</strong>
                        <p>Scan the recipient's QR code or enter their user ID</p>
                        <p>The points will be deducted from your account and added to theirs</p>
                    </div>
                    <div className="info-item">
                        <strong>QR Code Scanning:</strong>
                        <p>Click the "Scan" button to open your camera</p>
                        <p>Point your camera at the recipient's QR code</p>
                        <p>The user ID will be automatically filled in</p>
                    </div>
                    <div className="info-item">
                        <strong>Requirements:</strong>
                        <p>You must be verified to transfer points</p>
                        <p>You must have sufficient points in your account</p>
                        <p>The recipient must have a valid account</p>
                    </div>
                    <div className="info-item">
                        <strong>Irreversible:</strong>
                        <p>Transfers cannot be undone once completed</p>
                        <p>Please double-check the recipient user ID before confirming</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferTransaction;

