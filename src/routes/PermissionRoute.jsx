import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PermissionRoute({ permission, children }) {
    const { isAuthenticated, hasPermission } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!hasPermission(permission)) {
        return <Navigate to="/home" replace />;
    }

    return children;
}
