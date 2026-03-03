import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    try {
      const response = await api.post("/auth/register", data);
      // Use our context login function to save user + token
      login(response.data.user, response.data.token);
      navigate("/"); // redirect to home after registration
    } catch (err: any) {
      setServerError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div>
          <label>Username</label>
          <input
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "At least 3 characters" },
            })}
          />
          {errors.username && <p className="error">{errors.username.message}</p>}
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
};

export default Register;