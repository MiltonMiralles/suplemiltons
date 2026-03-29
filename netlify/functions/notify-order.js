exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { message, order } = JSON.parse(event.body);

    const OWNER_EMAIL = process.env.OWNER_EMAIL || '';
    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';

    // Intentar enviar a Discord webhook (gratis, instantaneo)
    if (DISCORD_WEBHOOK) {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.replace(/\*/g, '**'),
          username: 'Suplemiltons Bot'
        })
      }).catch(() => {});
    }

    // Log del pedido (visible en Netlify Functions logs)
    console.log('=== NUEVO PEDIDO ===');
    console.log('Cliente:', order.customer.name);
    console.log('Tel:', order.customer.phone);
    console.log('Email:', order.customer.email);
    console.log('Direccion:', order.customer.address);
    console.log('Notas:', order.customer.notes || '-');
    console.log('Productos:', order.items.map(i => `${i.qty}x ${i.name}`).join(', '));
    console.log('Total:', order.total);
    console.log('Pago:', order.payment);
    console.log('Fecha:', order.date);
    console.log('====================');

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error procesando notificacion' })
    };
  }
};
