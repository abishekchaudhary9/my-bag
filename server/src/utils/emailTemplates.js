/**
 * Email templates for Maison Bag
 */

const loginAlertTemplate = ({ name, email, ip, userAgent, date }) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="padding: 40px 20px; text-align: center; background-color: #fcfcfc; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-weight: 300; letter-spacing: 4px; color: #111; text-transform: uppercase;">MAISON<span style="color: #b98f47;">.</span></h1>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="font-weight: 400; color: #111; margin-top: 0;">New Sign-in Alert</h2>
        <p>Hello ${name},</p>
        <p>Your Maison account was recently accessed via <strong>Google Sign-in</strong>. If this was you, you can safely ignore this email.</p>
        
        <div style="background-color: #f9f9f9; padding: 25px; margin: 30px 0; border-left: 3px solid #b98f47;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding-bottom: 8px; color: #888; width: 100px;">Account:</td>
              <td style="padding-bottom: 8px; font-weight: 500;">${email}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 8px; color: #888;">Time:</td>
              <td style="padding-bottom: 8px; font-weight: 500;">${date}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 8px; color: #888;">IP Address:</td>
              <td style="padding-bottom: 8px; font-weight: 500;">${ip}</td>
            </tr>
            <tr>
              <td style="color: #888;">Device:</td>
              <td style="font-weight: 500;">${userAgent}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px;">
          If you don't recognize this activity, we recommend reviewing your account security or contacting our support team immediately.
        </p>
        
        <div style="margin-top: 40px;">
          <a href="${process.env.CLIENT_URL?.split(',')[0] || 'https://maison.com'}/profile" 
             style="background-color: #111; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
            Review Account Activity
          </a>
        </div>
      </div>
      
      <div style="padding: 30px 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #aaa;">
        <p>&copy; ${new Date().getFullYear()} Maison Luxe E-commerce. All rights reserved.</p>
        <p>This is an automated security notification.</p>
      </div>
    </div>
  `;
};

const welcomeTemplate = ({ name }) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="padding: 40px 20px; text-align: center; background-color: #fcfcfc; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-weight: 300; letter-spacing: 4px; color: #111; text-transform: uppercase;">MAISON<span style="color: #b98f47;">.</span></h1>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <h2 style="font-weight: 300; color: #111; margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">Welcome to the House of Maison</h2>
        <p style="font-size: 16px; color: #666;">Hello ${name},</p>
        <p style="font-size: 16px; color: #666;">We are delighted to welcome you to Maison. Your account has been successfully created, and you now have access to our curated collection of luxury essentials.</p>
        
        <div style="margin: 40px 0;">
          <a href="${process.env.CLIENT_URL?.split(',')[0] || 'https://maison.com'}/products" 
             style="background-color: #111; color: #fff; padding: 18px 35px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
            Explore the Collection
          </a>
        </div>
        
        <p style="font-size: 14px; color: #999;">If you have any questions, our concierge team is always here to assist you.</p>
      </div>
      
      <div style="padding: 30px 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #aaa;">
        <p>&copy; ${new Date().getFullYear()} Maison Luxe E-commerce. All rights reserved.</p>
      </div>
    </div>
  `;
};

const orderConfirmationTemplate = ({ name, orderNumber, items, subtotal, shipping, discount, total, address }) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
        <div style="font-weight: 500; color: #111;">${item.name}</div>
        <div style="font-size: 12px; color: #888;">${item.color || ''} ${item.size || ''} &times; ${item.qty}</div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">
        Rs ${(item.price * item.qty).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="padding: 40px 20px; text-align: center; background-color: #fcfcfc; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-weight: 300; letter-spacing: 4px; color: #111; text-transform: uppercase;">MAISON<span style="color: #b98f47;">.</span></h1>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="font-weight: 300; color: #111; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Order Confirmed</h2>
        <p>Hello ${name},</p>
        <p>Thank you for your purchase. We've received your order <strong>#${orderNumber}</strong> and it is now being prepared for shipment.</p>
        
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 40px; border-bottom: 1px solid #111; padding-bottom: 5px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
        
        <table style="width: 100%; margin-top: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #888;">Subtotal</td>
            <td style="padding: 5px 0; text-align: right;">Rs ${subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #888;">Shipping</td>
            <td style="padding: 5px 0; text-align: right;">Rs ${shipping.toLocaleString()}</td>
          </tr>
          ${discount ? `
          <tr>
            <td style="padding: 5px 0; color: #b98f47;">Discount</td>
            <td style="padding: 5px 0; text-align: right; color: #b98f47;">-Rs ${discount.toLocaleString()}</td>
          </tr>` : ''}
          <tr style="font-size: 18px; font-weight: bold; color: #111;">
            <td style="padding: 20px 0 5px 0;">Total</td>
            <td style="padding: 20px 0 5px 0; text-align: right;">Rs ${total.toLocaleString()}</td>
          </tr>
        </table>
        
        <div style="margin-top: 40px; background-color: #f9f9f9; padding: 20px;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; color: #888;">Shipping Address</h3>
          <p style="font-size: 14px; margin-bottom: 0;">${address}</p>
        </div>
        
        <div style="margin-top: 40px; text-align: center;">
          <a href="${process.env.CLIENT_URL?.split(',')[0] || 'https://maison.com'}/orders" 
             style="background-color: #111; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
            Track Your Order
          </a>
        </div>
      </div>
      
      <div style="padding: 30px 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #aaa;">
        <p>&copy; ${new Date().getFullYear()} Maison Luxe E-commerce. All rights reserved.</p>
        <p>You received this email because you made a purchase at Maison Bag.</p>
      </div>
    </div>
  `;
};

module.exports = {
  loginAlertTemplate,
  welcomeTemplate,
  orderConfirmationTemplate,
};
