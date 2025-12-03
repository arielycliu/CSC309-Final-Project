import { useAuth } from '../context/AuthContext';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/MyQRCode.css';

const MyQRCode = () => {
    const { user } = useAuth();

    if (!user?.id) {
        return (
            <div className="my-qr-code-page">
                <div className="page-header">
                    <h2>My QR Code</h2>
                    <p>Unable to load user information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-qr-code-page">

            <div className="qr-code-container">
                <div className="qr-code-card">
                    <div className="qr-code-header">
                        <QrCode size={24} />
                        <h3>My QR Code</h3>
                    </div>
                    <p className="qr-code-description">
                        Let other users scan this QR code to transfer points to you
                    </p>
                    <div className="qr-code-wrapper">
                        <QRCodeSVG 
                            value={user.id.toString()} 
                            size={300}
                            level="M"
                        />
                    </div>
                    <div className="qr-code-info">
                        <p className="qr-code-user-id">
                            User ID: <strong>{user.id}</strong>
                        </p>
                        {user.name && (
                            <p className="qr-code-user-name">
                                Name: <strong>{user.name}</strong>
                            </p>
                        )}
                        {user.utorid && (
                            <p className="qr-code-utorid">
                                UTORid: <strong>{user.utorid}</strong>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyQRCode;

