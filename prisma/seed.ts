import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos de prueba...');

  // Limpiar datos existentes (opcional - comentar si no quieres eliminar datos)
  console.log('🗑️  Limpiando datos existentes...');
  
  try {
    await prisma.asistencia.deleteMany();
    await prisma.clienteMedida.deleteMany();
    await prisma.medida.deleteMany();
    await prisma.novedad.deleteMany();
    await prisma.compra.deleteMany();
    await prisma.producto.deleteMany();
    await prisma.pago.deleteMany();
    await prisma.deuda.deleteMany();
    await prisma.clientePlan.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.serieRep.deleteMany();
    await prisma.serieTiempo.deleteMany();
    await prisma.ejercicioMusculo.deleteMany();
    await prisma.ejercicio.deleteMany();
    await prisma.musculoSemana.deleteMany();
    await prisma.musculo.deleteMany();
    await prisma.semana.deleteMany();
    await prisma.entrenamiento.deleteMany();
    await prisma.rutina.deleteMany();
    await prisma.gasto.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.administrador.deleteMany();
    await prisma.entrenador.deleteMany();
    await prisma.recepcionista.deleteMany();
    await prisma.usuario.deleteMany();
  } catch (error) {
    console.log('⚠️  Advertencia al limpiar: Es posible que algunas tablas no existan aún.');
    console.log('   Continuando con la creación de datos...');
  }

  // Hash de contraseñas (todas serán 'password123' para facilitar las pruebas)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. CREAR ADMINISTRADOR
  console.log('👤 Creando Administrador...');
  const adminUsuario = await prisma.usuario.create({
    data: {
      userName: 'admin_principal',
      password: hashedPassword,
      nombres: 'Carlos',
      apellidos: 'Administrador López',
      cedula: '1234567890',
      fechaNacimiento: '1985-05-15',
    },
  });

  await prisma.administrador.create({
    data: {
      usuarioId: adminUsuario.id,
    },
  });

  // 2. CREAR ENTRENADOR
  console.log('🏋️  Creando Entrenador...');
  const entrenadorUsuario = await prisma.usuario.create({
    data: {
      userName: 'entrenador_juan',
      password: hashedPassword,
      nombres: 'Juan',
      apellidos: 'Pérez Martínez',
      cedula: '0987654321',
      fechaNacimiento: '1990-08-22',
    },
  });

  await prisma.entrenador.create({
    data: {
      usuarioId: entrenadorUsuario.id,
      horario: 'Mañana',
      sueldo: 1500.00,
    },
  });

  // 3. CREAR CLIENTE COMPLETO (con datos en tabla Cliente)
  console.log('🏃 Creando Cliente Completo...');
  const clienteCompletoUsuario = await prisma.usuario.create({
    data: {
      userName: 'cliente_maria',
      password: hashedPassword,
      nombres: 'María',
      apellidos: 'García Rodríguez',
      cedula: '1122334455',
      fechaNacimiento: '1995-03-10',
    },
  });

  // Cliente tiene id = usuarioId según la migración cliente_id_equals_usuario_id
  await prisma.cliente.create({
    data: {
      id: clienteCompletoUsuario.id, // El ID del cliente es igual al ID del usuario
      usuarioId: clienteCompletoUsuario.id,
      horario: 'Tarde',
      sexo: 'Femenino',
      observaciones: 'Cliente activa y comprometida con sus entrenamientos',
      objetivos: 'Perder peso y tonificar músculos',
      tiempoEntrenar: 60, // minutos
    },
  });

  // 4. CREAR CLIENTE INCOMPLETO (solo en tabla Usuario, sin datos en Cliente)
  console.log('👤 Creando Cliente Incompleto (solo Usuario)...');
  await prisma.usuario.create({
    data: {
      userName: 'cliente_pedro_incompleto',
      password: hashedPassword,
      nombres: 'Pedro',
      apellidos: 'Sánchez Gómez',
      cedula: '5544332211',
      fechaNacimiento: '1998-11-28',
    },
  });

  // Crear algunos datos adicionales útiles
  console.log('📦 Creando datos adicionales...');
  
  // Crear un plan de ejemplo
  const planBasico = await prisma.plan.create({
    data: {
      nombre: 'Plan Básico Mensual',
      precio: 50.00,
      mesesPagar: 1,
    },
  });

  // Asignar plan al cliente completo
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setMonth(fechaFin.getMonth() + 1);

  await prisma.clientePlan.create({
    data: {
      clienteId: clienteCompletoUsuario.id,
      planId: planBasico.id,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      diaPago: 1,
      activado: true,
    },
  });

  // Crear algunas medidas de ejemplo
  await prisma.medida.createMany({
    data: [
      { nombre: 'Peso' },
      { nombre: 'Altura' },
      { nombre: 'Pecho' },
      { nombre: 'Cintura' },
      { nombre: 'Cadera' },
    ],
  });

  // Crear algunos productos de ejemplo
  await prisma.producto.createMany({
    data: [
      { nombre: 'Proteína Whey', precio: 45.00, stock: 20, estado: true },
      { nombre: 'Creatina', precio: 30.00, stock: 15, estado: true },
      { nombre: 'Toalla de gimnasio', precio: 12.00, stock: 50, estado: true },
    ],
  });

  // Crear algunos músculos de ejemplo
  await prisma.musculo.createMany({
    data: [
      { nombre: 'Pecho' },
      { nombre: 'Espalda' },
      { nombre: 'Piernas' },
      { nombre: 'Hombros' },
      { nombre: 'Brazos' },
      { nombre: 'Abdominales' },
    ],
  });

  // Crear algunos ejercicios de ejemplo
  await prisma.ejercicio.createMany({
    data: [
      { nombre: 'Press de banca' },
      { nombre: 'Sentadilla' },
      { nombre: 'Peso muerto' },
      { nombre: 'Dominadas' },
      { nombre: 'Press militar' },
      { nombre: 'Curl de bíceps' },
      { nombre: 'Extensión de tríceps' },
      { nombre: 'Crunches' },
    ],
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('');
  console.log('📋 RESUMEN DE USUARIOS CREADOS:');
  console.log('================================');
  console.log('');
  console.log('1. ADMINISTRADOR:');
  console.log('   Cédula: 1234567890');
  console.log('   Contraseña: password123');
  console.log('   Nombre: Carlos Administrador López');
  console.log('');
  console.log('2. ENTRENADOR:');
  console.log('   Cédula: 0987654321');
  console.log('   Contraseña: password123');
  console.log('   Nombre: Juan Pérez Martínez');
  console.log('   Horario: Mañana');
  console.log('');
  console.log('3. CLIENTE COMPLETO:');
  console.log('   Cédula: 1122334455');
  console.log('   Contraseña: password123');
  console.log('   Nombre: María García Rodríguez');
  console.log('   Horario: Tarde');
  console.log('   Sexo: Femenino');
  console.log('');
  console.log('4. CLIENTE INCOMPLETO (solo Usuario):');
  console.log('   Cédula: 5544332211');
  console.log('   Contraseña: password123');
  console.log('   Nombre: Pedro Sánchez Gómez');
  console.log('   (Sin datos en tabla Cliente)');
  console.log('');
  console.log('================================');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
