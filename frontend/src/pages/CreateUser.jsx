
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {use, useState, useEffect } from "react";
import { set, z } from "zod";
import { useAuth } from "../context/AuthContext";
import "../styles/users.css"
import { createUser as createUserAPI } from "../lib/Users";
import { toast } from 'sonner';

const createUsersPayload = z.object({
    utorid: z.string().min(7, "must be atleast 7 characters long").max(8, "utorid too long"),
    name: z.string().min(1, "too short").max(50, "too long"),
    email: z.string().email("invalid email format").refine(val => val.endsWith("@mail.utoronto.ca"), {
        message: "must be of domain @mail.utoronto.ca"
    }),
});

const CreateUser = () => {
    const [loading, setLoading] = useState(false);
    const {activeRole} = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const isCashier = activeRole === 'cashier';


    const [formData, setFormData] = useState({
        email: "",
        name: "",
        utorid: "",
    });

    const isManagerOrAbove = activeRole && ['manager', 'superuser'].includes(activeRole);
    const isSuperuser = activeRole && activeRole === 'superuser';
    
    const handleCreateUser = async () => {
        setLoading(true);
        try {
            const newUser = await createUserAPI(formData);
            setLoading(false);
            toast.success(`User ${newUser.name} created successfully.`);
            setErrors({});
            navigate(isCashier ? '/' : '/users');
        } catch (error) {
            setLoading(false);
            setErrors(error.error || {});
            console.error("Failed to create user:", JSON.stringify(error));
            toast.error("Failed to create user.");
        }
    };
    const handleSubmit = async(e) => {
        e.preventDefault();

        const result = createUsersPayload.safeParse(formData);

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
        await handleCreateUser();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let finalValue = value;
        
       
        // Convert empty string to undefined
        if (value === "") {
            finalValue = undefined;
        }

        setFormData({
            ...formData,
            [name]: finalValue
        });
    };

    return (
        <div className='user-form-page'>
            <div className="description">
                <p id="title">Create User</p>
            </div>

            <form className="create user-form" onSubmit={handleSubmit}>
                <label className='required'>UTORid</label>
                <input type="text" placeholder="UTORid" name="utorid" onChange={handleChange} value={formData.utorid || ""} required style={{fontFamily: "'Courier New', Courier, monospace"}}></input>
                <p className={errors.utorid? "input-error": "input-error message"}>{errors.utorid || "At least 7 characters"}</p>

                <label className='required'>Name</label>
                <input type="text" placeholder="Name" name="name" onChange={handleChange} value={formData.name || ""} required></input>
                <p className={errors.name? "input-error": "input-error message"}>{errors.name || "Maximum 50 characters"}</p>

                <label className='required'>Email</label>
                <input type="email" placeholder="@mail.utoronto.ca" name="email" onChange={handleChange} value={formData.email || ""} required></input>
                <p className={errors.email? "input-error": "input-error message"}>{errors.email || "Email must be of domain @mail.utoronto.ca"}</p>


                <div className="user-form-buttons">
                    <button className="cancel-btn" type="button" onClick={() => navigate(isCashier ? '/' : '/users')} disabled={loading}>
                        Cancel
                    </button>
                    <button className="submit-user-form-btn" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateUser;
