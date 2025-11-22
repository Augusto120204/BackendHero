import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  async obtenerIngresos(periodo: 'dia' | 'mes' | 'anio') {
    if (periodo === 'dia') {
      // Agrupar ingresos por día (últimos 30 días)
      const pagos = await this.prisma.pago.groupBy({
        by: ['fecha'],
        _sum: { monto: true },
        orderBy: { fecha: 'asc' },
      });

      // Convertir a formato amigable
      return pagos.map(p => ({
        label: p.fecha.toISOString().slice(0, 10),
        total: p._sum.monto ?? 0,
      }));
    }

    if (periodo === 'mes') {
      // Agrupar ingresos por mes del año actual
      const year = new Date().getFullYear();
      const pagos = await this.prisma.$queryRaw<
        { mes: number; total: number }[]
      >`
        SELECT EXTRACT(MONTH FROM fecha) AS mes, SUM(monto) AS total
        FROM "Pago"
        WHERE EXTRACT(YEAR FROM fecha) = ${year}
        GROUP BY mes
        ORDER BY mes;
      `;

      return pagos.map(p => ({
        label: new Date(0, p.mes - 1).toLocaleString('es', { month: 'short' }),
        total: Number(p.total),
      }));
    }

    if (periodo === 'anio') {
      // Agrupar ingresos por año
      const pagos = await this.prisma.$queryRaw<
        { anio: number; total: number }[]
      >`
        SELECT EXTRACT(YEAR FROM fecha) AS anio, SUM(monto) AS total
        FROM "Pago"
        GROUP BY anio
        ORDER BY anio;
      `;

      return pagos.map(p => ({
        label: String(p.anio),
        total: Number(p.total),
      }));
    }

    return [];
  }
}
