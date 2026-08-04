/**
 * Seed de la base de datos.
 *
 * Uso seguro:
 *   ADMIN_EMAIL="admin@empresa.com" ADMIN_PASSWORD="..." npm run db:seed
 *
 * No hay contraseñas por defecto ni se imprimen secretos en consola.
 */
import { PrismaClient, EstadoIncidencia } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function leerEnvObligatoria(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) {
    throw new Error(`Falta la variable obligatoria ${nombre}.`);
  }
  return valor;
}

async function main() {
  const email = leerEnvObligatoria("ADMIN_EMAIL").toLowerCase();
  const password = leerEnvObligatoria("ADMIN_PASSWORD");
  const nombre = process.env.ADMIN_NOMBRE?.trim() || "Administrador";

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { email, password: passwordHash, nombre, rol: "ADMIN" },
  });
  console.log(`Administrador listo: ${admin.email}`);

  const lectorEmail = process.env.LECTOR_EMAIL?.trim().toLowerCase();
  const lectorPassword = process.env.LECTOR_PASSWORD?.trim();
  if (lectorEmail && lectorPassword) {
    const lectorHash = await bcrypt.hash(lectorPassword, 12);
    const lector = await prisma.usuario.upsert({
      where: { email: lectorEmail },
      update: {},
      create: {
        email: lectorEmail,
        password: lectorHash,
        nombre: "Lector",
        rol: "LECTOR",
      },
    });
    console.log(`Usuario de solo lectura listo: ${lector.email}`);
  }

  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({
      data: { nombreEmpresa: "ImpresiónWeb", tema: "system" },
    });
    console.log("Configuración inicial creada.");
  }

  if (process.env.SEED_DEMO_DATA !== "true") {
    console.log("Seed completado sin datos de ejemplo.");
    return;
  }

  const totalProyectos = await prisma.proyecto.count();
  if (totalProyectos === 0) {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const semanaPasada = new Date(hoy);
    semanaPasada.setDate(hoy.getDate() - 6);

    const proyecto1 = await prisma.proyecto.create({
      data: {
        titulo: "Prototipo carcasa dron",
        descripcion:
          "Impresión de la carcasa y soportes internos del prototipo de dron ligero.",
        impresiones: {
          create: [
            { nombre: "Carcasa superior", cantidad: 2, tiempo: 180, fecha: hoy },
            { nombre: "Soporte de motor", cantidad: 4, tiempo: 95, fecha: hoy },
            { nombre: "Tapa de batería", cantidad: 1, tiempo: 60, fecha: ayer },
          ],
        },
      },
    });

    await prisma.proyecto.create({
      data: {
        titulo: "Piezas de recambio maquinaria",
        descripcion: "Engranajes y bujes de repuesto para la línea de producción.",
        impresiones: {
          create: [
            {
              nombre: "Engranaje 20 dientes",
              cantidad: 10,
              tiempo: 240,
              fecha: semanaPasada,
            },
            {
              nombre: "Buje deslizante",
              cantidad: 6,
              tiempo: 120,
              fecha: semanaPasada,
            },
          ],
        },
      },
    });

    console.log(`Proyecto de ejemplo creado: ${proyecto1.titulo}`);

    await prisma.incidencia.createMany({
      data: [
        {
          titulo: "Adhesión insuficiente en la cama caliente",
          descripcion:
            "<p>La primera capa <strong>no se adhiere correctamente</strong> a la cama. Revisar nivelación y temperatura.</p><ul><li>Comprobar nivelación</li><li>Aumentar temperatura de cama a 60°C</li></ul>",
          estado: EstadoIncidencia.EN_PROCESO,
        },
        {
          titulo: "Obstrucción parcial del extrusor",
          descripcion:
            "<p>Se detecta <em>flujo irregular</em> de material. Posible obstrucción parcial en la boquilla.</p>",
          estado: EstadoIncidencia.ABIERTA,
        },
        {
          titulo: "Calibración de ejes completada",
          descripcion:
            "<p>Se recalibraron los ejes X e Y. <strong>Resuelto.</strong></p>",
          estado: EstadoIncidencia.RESUELTA,
        },
      ],
    });
    console.log("Incidencias de ejemplo creadas.");
  }

  console.log("Seed completado correctamente.");
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
