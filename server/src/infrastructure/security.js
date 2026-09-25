import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Adaptadores de salida para los puertos PasswordHasher y TokenService.
export const passwordHasher={
  hash:password=>bcrypt.hash(password,12),
  compare:(password,hash)=>bcrypt.compare(password,hash),
};
export const tokenService={
  sign:user=>jwt.sign({sub:String(user.id),role:user.role},process.env.JWT_SECRET,{expiresIn:'2h'}),
  verify:token=>jwt.verify(token,process.env.JWT_SECRET),
};
