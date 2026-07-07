export interface JwtPayload {

    userId: string;
  
    email: string;
  
    role: "ADMIN" | "CUSTOMER";
  
  }