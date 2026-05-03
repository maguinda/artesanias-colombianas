// src/components/Footer/Footer.jsx
import './Footer.css'
import logoImg   from '../../assets/images/LOGO.png'
import nombreImg from '../../assets/images/nombre.png'
import instagramIcon from '../../assets/icons/instagram.png'
import facebookIcon  from '../../assets/icons/facebook.png'
import twitterIcon   from '../../assets/icons/x.png'
import tiktokIcon    from '../../assets/icons/tiktok.png'
import whatsappIcon  from '../../assets/icons/whatsapp.png'
import youtubeIcon   from '../../assets/icons/youtube.png'
import { CONTACT_INFO, STORES } from '../../config/constants'

function Footer() {
  return (
    <footer className="footer">
      {/* Logo */}
      <div className="footer__section footer__section--logo">
        <img src={logoImg}   className="footer__logo"   alt="logo" />
        <img src={nombreImg} className="footer__nombre" alt="Artesanías Colombianas" />
        <p className="footer__app-text">Descarga la aplicación</p>
      </div>

      {/* Tiendas */}
      <div className="footer__section footer__section--stores">
        <h4 className="footer__title">Vista nuestros puntos físicos</h4>
        <p className="footer__city">Bogotá</p>
        <p className="footer__text">{STORES.tienda_1}</p>
        <p className="footer__text">{STORES.tienda_2}</p>
        <p className="footer__city">Medellín</p>
        <p className="footer__text">{STORES.tienda_3}</p>
      </div>

      {/* Contacto */}
      <div className="footer__section footer__section--contact">
        <h4 className="footer__title">Contáctanos</h4>
        {CONTACT_INFO.emails.map((e, i) => (
          <p key={i} className="footer__text">{e}</p>
        ))}
        {CONTACT_INFO.phones.map((p, i) => (
          <p key={i} className="footer__text">{p}</p>
        ))}
      </div>

      {/* Redes sociales */}
      <div className="footer__section footer__section--social">
        <h4 className="footer__title">Síguenos en redes sociales</h4>
        <div className="footer__social-row">
          <img src={instagramIcon} className="footer__social-icon" alt="Instagram" />
          <img src={facebookIcon}  className="footer__social-icon" alt="Facebook" />
          <img src={twitterIcon}   className="footer__social-icon" alt="X / Twitter" />
        </div>
        <div className="footer__social-row">
          <img src={tiktokIcon}   className="footer__social-icon" alt="TikTok" />
          <img src={whatsappIcon} className="footer__social-icon" alt="WhatsApp" />
          <img src={youtubeIcon}  className="footer__social-icon" alt="YouTube" />
        </div>
      </div>
    </footer>
  )
}

export default Footer
