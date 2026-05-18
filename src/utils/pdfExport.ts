import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { QuizResult } from '@/types'

export function exportResultadoPDF(resultado: QuizResult, nombreEstudiante: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(86, 99, 255)
  doc.rect(0, 0, W, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('PAES Prep — Informe de Ensayo', W / 2, 15, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`${resultado.nombreAsignatura}  ·  ${new Date(resultado.fecha).toLocaleDateString('es-CL')}`, W / 2, 25, { align: 'center' })

  // Resumen
  doc.setTextColor(30, 30, 60)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Resumen de Resultados', 14, 48)

  const resumenData = [
    ['Estudiante', nombreEstudiante],
    ['Puntaje PAES Estimado', `${resultado.puntajePaes} pts`],
    ['Porcentaje de Logro', `${resultado.porcentajeLogro}%`],
    ['Nota Equivalente', `${resultado.nota}`],
    ['Respuestas Correctas', `${resultado.correctas} / ${resultado.totalPreguntas}`],
    ['Respuestas Incorrectas', String(resultado.incorrectas)],
    ['Preguntas Omitidas', String(resultado.omitidas)],
    ['Tiempo Total', formatTiempo(resultado.tiempoTotal)],
    ['Tiempo Promedio / Pregunta', `${resultado.tiempoPromedio}s`],
  ]

  autoTable(doc, {
    startY: 52,
    head: [],
    body: resumenData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 242, 255] } },
  })

  // Rendimiento por tema
  const afterResumen = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Rendimiento por Tema', 14, afterResumen)

  const temaRows = Object.entries(resultado.porTema).map(([tema, datos]) => [
    tema,
    `${datos.correctas} / ${datos.total}`,
    `${datos.porcentaje}%`,
    datos.nivel === 'domina' ? '✓ Domina' : datos.nivel === 'en_proceso' ? '~ En proceso' : '✗ Reforzar',
  ])

  autoTable(doc, {
    startY: afterResumen + 4,
    head: [['Tema', 'Correctas', 'Porcentaje', 'Nivel']],
    body: temaRows,
    theme: 'striped',
    headStyles: { fillColor: [86, 99, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const text = data.cell.raw as string
        if (text.includes('✓')) doc.setTextColor(34, 197, 94)
        else if (text.includes('✗')) doc.setTextColor(239, 68, 68)
        else doc.setTextColor(234, 179, 8)
      }
    },
  })

  // Fortalezas y Debilidades
  const afterTemas = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  if (resultado.fortalezas.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(34, 197, 94)
    doc.text('Fortalezas', 14, afterTemas)
    doc.setTextColor(30, 30, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    resultado.fortalezas.forEach((f, i) => {
      doc.text(`• ${f}`, 18, afterTemas + 6 + i * 5)
    })
  }

  const afterFortalezas = afterTemas + 6 + resultado.fortalezas.length * 5 + 6

  if (resultado.debilidades.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(239, 68, 68)
    doc.text('Áreas a Reforzar', 14, afterFortalezas)
    doc.setTextColor(30, 30, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    resultado.debilidades.forEach((d, i) => {
      doc.text(`• ${d}`, 18, afterFortalezas + 6 + i * 5)
    })
  }

  const afterDebilidades = afterFortalezas + 6 + resultado.debilidades.length * 5 + 8

  // Recomendaciones
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(86, 99, 255)
  doc.text('Recomendaciones Personalizadas', 14, afterDebilidades)
  doc.setTextColor(30, 30, 60)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  let yRec = afterDebilidades + 6
  resultado.recomendaciones.forEach((rec) => {
    const lines = doc.splitTextToSize(`• ${rec}`, W - 28) as string[]
    doc.text(lines, 18, yRec)
    yRec += lines.length * 5 + 2
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `PAES Prep  ·  Generado el ${new Date().toLocaleDateString('es-CL')}  ·  Página ${i} de ${pageCount}`,
      W / 2, 290, { align: 'center' }
    )
  }

  doc.save(`PAES_Prep_${resultado.asignatura}_${new Date(resultado.fecha).toISOString().split('T')[0]}.pdf`)
}

function formatTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}m ${s}s`
}
