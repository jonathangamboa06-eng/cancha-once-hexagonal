import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';

export function asyncRoute(fn){return(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);}
export const requireAdmin=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({error:'Se requiere rol administrador.'});
export function createHttpApp({services,tokens}) {
const {authService,orderService,productService,userService}=services;
const app=express();
app.use(helmet());
app.use(cors({origin:(process.env.CLIENT_ORIGIN??'http://localhost:5173').split(',').map(v=>v.trim()),credentials:false}));
app.use(express.json({limit:'32kb'}));
const idParam=req=>{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)throw Object.assign(new Error('ID no válido.'),{status:400});return id;};
const authLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false,message:{error:'Demasiados intentos. Prueba más tarde.'}});
function requireAuth(req,res,next){const token=req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];if(!token)return res.status(401).json({error:'Se requiere iniciar sesión.'});try{req.user=tokens.verify(token);next();}catch{return res.status(401).json({error:'Sesión inválida o vencida.'});}}
const protectedRoute=[requireAuth];
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.post('/api/auth/register',authLimiter,asyncRoute(async(req,res)=>res.status(201).json(await authService.register(req.body))));
app.post('/api/auth/login',authLimiter,asyncRoute(async(req,res)=>res.json(await authService.login(req.body))));
app.get('/api/products',asyncRoute(async(req,res)=>res.json(await productService.list())));
app.get('/api/products/:id',asyncRoute(async(req,res)=>res.json(await productService.get(idParam(req)))));
app.post('/api/products',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>res.status(201).json(await productService.create(req.body))));
app.put('/api/products/:id',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>res.json(await productService.update(idParam(req),req.body))));
app.delete('/api/products/:id',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>{await productService.remove(idParam(req));res.status(204).end();}));
app.get('/api/users',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>res.json(await userService.list())));
app.get('/api/users/:id',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>res.json(await userService.get(idParam(req)))));
app.post('/api/users',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>res.status(201).json(await authService.createUser(req.body))));
app.put('/api/users/:id',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>res.json(await userService.update(idParam(req),req.body))));
app.delete('/api/users/:id',...protectedRoute,requireAdmin,asyncRoute(async(req,res)=>{await userService.remove(idParam(req));res.status(204).end();}));
app.post('/api/orders',...protectedRoute,asyncRoute(async(req,res)=>res.status(201).json(await orderService.create(req.user.sub,req.body.items))));
app.get('/api/orders',...protectedRoute,asyncRoute(async(req,res)=>res.json(await orderService.list(req.user.sub,req.user.role==='admin'))));
app.get('/api/orders/:id',...protectedRoute,asyncRoute(async(req,res)=>res.json(await orderService.get(idParam(req),req.user.sub,req.user.role==='admin'))));
app.put('/api/orders/:id',...protectedRoute,asyncRoute(async(req,res)=>res.json(await orderService.update(idParam(req),req.user.sub,req.user.role==='admin',req.body))));
app.delete('/api/orders/:id',...protectedRoute,asyncRoute(async(req,res)=>{await orderService.remove(idParam(req),req.user.sub,req.user.role==='admin');res.status(204).end();}));
app.use((req,res)=>res.status(404).json({error:'Ruta no encontrada.'}));
app.use((err,req,res,next)=>{const status=err.status??(err.code==='23505'?409:err.code==='23503'?409:400);if(status>=500)console.error(err);res.status(status).json({error:status===409?err.message:status===400?err.message:'Error interno del servidor.'});});
return app;
}
