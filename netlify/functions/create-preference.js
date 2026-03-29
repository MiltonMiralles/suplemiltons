exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

  if (!MP_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'MercadoPago no configurado' })
    };
  }

  try {
    const order = JSON.parse(event.body);

    const items = order.items.map(item => ({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'ARS'
    }));

    const preference = {
      items,
      payer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: { number: order.customer.phone }
      },
      back_urls: {
        success: 'https://suplemiltons.com/?pago=ok',
        failure: 'https://suplemiltons.com/?pago=error',
        pending: 'https://suplemiltons.com/?pago=pendiente'
      },
      auto_return: 'approved',
      external_reference: `order_${Date.now()}`,
      notification_url: 'https://suplemiltons.com/.netlify/functions/mp-webhook',
      statement_descriptor: 'SUPLEMILTONS'
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('MP error:', err);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error al crear preferencia de pago' })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_point: data.init_point, id: data.id })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
