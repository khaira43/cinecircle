import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      const response = await api.post("/auth/login", data);
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err: any) {
      setServerError(
        err.response?.data?.error || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

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
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;