import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "./Roles";

interface JwtValidity {
    isValid: boolean;
    role: Role;
    expiry: number;
}

interface JwtRolePayload extends JwtPayload {
    role?: Role;
}

const INVALID_RESULT: JwtValidity = {
    isValid: false,
    role: Role.Invalid,
    expiry: 0,
}

export default function verifyJwt(jwtToken: string, jwtSecret: string, minimumRoleRequired: Role) {

    try {
        const { role, exp, iat } = jwt.verify(jwtToken, jwtSecret) as JwtRolePayload;

        // Check field existence
        if (!role) { return INVALID_RESULT; }
        if (!exp) { return INVALID_RESULT; }
        if (!iat) { return INVALID_RESULT; }

        // Check role
        if (role < minimumRoleRequired) { return INVALID_RESULT; }

        // Check expiry
        const duration = Math.max(0, exp - iat) * 1000;
        if (duration < 0) { return INVALID_RESULT; }
        const expiry = Date.now() + duration;

        return {
            isValid: true,
            role,
            expiry,
        }

    } catch {
        return INVALID_RESULT;
    }
}