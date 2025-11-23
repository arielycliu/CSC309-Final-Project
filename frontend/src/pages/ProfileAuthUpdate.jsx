import {useState } from "react";
import { z } from "zod";
import '../styles/profile.css';
import{NavLink} from "react-router-dom"

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
    const [errors, setErrors] = useState({});
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

    const handleSubmit = (e) => {
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
        console.log("VALID form:", result.data);
    };

    return(
         <div className="settings-page">
            <div className="description">
                <p id="title">Account Access</p>
                <p id="explanation">Change password</p>
            </div> 
            <form className="password" onSubmit={handleSubmit}>
                <div className="right-inputs">
                    <label>Old Password</label>
                    <input type="password" name="old" onChange={handleChange} />
                    <p className="input-error">{errors.old || "\u00A0"}</p>

                    <label>New Password</label>
                    <input type="password"  name="new" onChange={handleChange} />
                    <p className={errors.new? "input-error": "input-error message"}>{errors.new || 
                    "Password must be 8–20 characters with one upper, lower, number, and special character."}</p>

                    <label>Confirm Password</label>
                    <input type="password" name="confirm" onChange={handleChange}/>
                    <p className="input-error">{errors.confirm || "\u00A0"}</p>

                    <NavLink to="/" id="forgot-password">Forgot password?</NavLink>
                    <button className="submit-form password" type="submit">Update Password</button>
                </div>
            </form>
         </div>
    )
}

export default ProfileAuthUpdate;