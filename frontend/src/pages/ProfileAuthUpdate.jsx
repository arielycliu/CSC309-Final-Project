import {useState } from "react";
import { z } from "zod";
import '../styles/profile.css';
import{NavLink} from "react-router-dom"
import { toast } from 'sonner';
import {useAuth} from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "../lib/Profile";

const updateOwnPasswordSchema = z.object({
   old: z.string(),
   new: z.string().min(8, "Password must be at least 8 characters long")
  .max(20, "Password must be at most 20 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirm:z.string(),
}).refine((data) => data.new === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"], // error will appear on confirm field
});

const ProfileAuthUpdate = () => {
    const {user} = useAuth();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showold, setShowOld] = useState(false);
    const [shownew, setShowNew] = useState(false);
    const [showconfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
            old: "",
            new: "",
            confirm: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdatePassword = async () => {
        setLoading(true);
        try {
            await updatePassword(formData.old, formData.new);
            
            setErrors({});
            setFormData({
                old: "",
                new: "",
                confirm: "",
            });
            toast.success("Password updated successfully!");
        } catch (error) {
            setErrors(error.error || {});
            console.error(`Error updating password:`, error);
            toast.error(`Failed to update password. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        const result = updateOwnPasswordSchema.safeParse(formData);

        if (!result.success) {
            // Convert Zod errors into { field: message }
            const fieldErrors = {};
            console.log("FULL ZOD ERROR OBJ:", result.error._zod.def);
            result.error._zod.def.forEach(err => {
                const field = err.path[0];
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return; // stop submit
        }

        setErrors({});
        await handleUpdatePassword();
        console.log("VALID form:", result.data);
    };

    const EyeToggle = ({ show, setShow, size = 20, color = "black" }) => {
    return (
        <button
            type="button"
            className="eyeToggle"
            onClick={() => setShow(prev => !prev)}
        >
            {show ? <EyeOff size={size} color={color} /> : <Eye size={size} color={color} />}
        </button>
    );
    };

    return(
         <div className="settings-page">
            <div className="description">
                <p id="title">Account Access</p>
                <p id="explanation">Change password</p>
            </div> 
            <form className="password" onSubmit={handleSubmit}>
                <div className="right-inputs">
                    <label className="required">Old Password</label>
                    <div className="password-input-wrapper">
                        <input type={showold ? "text" : "password"} name="old" value={formData.old} onChange={handleChange} required/>
                        <EyeToggle show={showold} setShow={setShowOld} color="black"/>
                    </div>
                    <p className="input-error">{errors.old || "\u00A0"}</p>

                    <label className="required">New Password</label>
                    <div className="password-input-wrapper">
                        <input type={shownew ? "text" : "password"}  name="new" value={formData.new} onChange={handleChange} required/>
                       <EyeToggle show={shownew} setShow={setShowNew} color="black"/>
                    </div>
                    <p className={errors.new? "input-error": "input-error message"}>{errors.new || 
                    "Password must be 8–20 characters with one upper, lower, number, and special character."}</p>

                    <label className="required">Confirm Password</label>
                    <div className="password-input-wrapper">
                        <input type={showconfirm ? "text" : "password"} name="confirm" value={formData.confirm} onChange={handleChange} required/>
                        <EyeToggle show={showconfirm} setShow={setShowConfirm} color="black"/>
                    </div>
                    <p className="input-error">{errors.confirm || "\u00A0"}</p>

                    <NavLink to="/password-reset" id="forgot-password">Forgot password?</NavLink>
                    <button className="submit-form password" type="submit" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
                </div>
            </form>
         </div>
    )
}

export default ProfileAuthUpdate;