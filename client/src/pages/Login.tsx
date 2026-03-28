import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { useAuth } from "../context/useAuth";
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
    //Test User
    if (data.email === "test@test.com" && data.password === "123456") {
      const fakeUser = {
        id: "user-123",
        username: "testuser",
        email: data.email,
      };

      login(fakeUser, "fake-token");
      navigate("/");
      return;
    }

    setServerError("");
    try {
      const response = await api.post("/auth/login", data);
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err: unknown) {
      const error = err as AxiosError<{ error?: string }>;
      setServerError(
          error.response?.data?.error || "Login failed. Please try again."
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
            {errors.password && (
                <p className="error">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="error">{serverError}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
  );
};

export default Login;