export async function POST(request) {
  try {
    const payload = await request.json();

    const imageUrl = payload.secure_url || 'URL não disponível';
    const originalFilename = payload.original_filename || 'Sem nome';
    const publicId = payload.public_id || 'Sem public_id';
    const format = payload.format || 'Desconhecido';
    const width = payload.width || 'N/A';
    const height = payload.height || 'N/A';
    const createdAt = payload.created_at || 'Sem data';

    const emailHtml = `
      <html>
        <body>
          <h2>Novo upload recebido</h2>
          <p><strong>Ficheiro:</strong> ${originalFilename}</p>
          <p><strong>Public ID:</strong> ${publicId}</p>
          <p><strong>Formato:</strong> ${format}</p>
          <p><strong>Dimensões:</strong> ${width} x ${height}</p>
          <p><strong>Data:</strong> ${createdAt}</p>
          <p><strong>Imagem:</strong> <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
        </body>
      </html>
    `;

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: process.env.NOTIFICATION_EMAIL,
            name: 'Admin'
          }
        ],
        subject: 'Novo upload recebido no Cloudinary',
        htmlContent: emailHtml
      })
    });

    const result = await brevoResponse.json();

    if (!brevoResponse.ok) {
      return new Response(JSON.stringify({ error: result }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, brevo: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export function GET() {
  return new Response(JSON.stringify({ message: 'Endpoint ativo. Usa POST.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
