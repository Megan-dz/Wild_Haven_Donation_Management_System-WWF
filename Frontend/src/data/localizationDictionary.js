const localizationDictionary = {
  en: {
    app: {
      name: "Wild Haven",
      tagline: "Wildlife Conservation Network",
      language: "English",
      locale: "en-US"
    },
    navigation: {
      home: "Home",
      programs: "Programs",
      impact: "Impact",
      donors: "Donors",
      volunteer: "Volunteer",
      contact: "Contact",
      donate: "Donate",
      dashboard: "Dashboard",
      login: "Log in",
      signup: "Sign up",
      profile: "My Profile",
      admin: "Admin",
      resources: "Resources",
      stories: "Stories",
      careers: "Careers"
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      continue: "Continue",
      back: "Back",
      next: "Next",
      submit: "Submit",
      update: "Update",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      search: "Search",
      filter: "Filter",
      loading: "Loading",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Information",
      required: "Required",
      optional: "Optional",
      learnMore: "Learn more",
      all: "All",
      status: "Status",
      date: "Date",
      amount: "Amount",
      currency: "Currency",
      yes: "Yes",
      no: "No",
      notAvailable: "Not available"
    },
    landing: {
      hero: {
        eyebrow: "Wildlife Conservation",
        title: "Protecting habitats. Empowering communities.",
        subtitle: "Every contribution restores habitat, safeguards species, and supports local stewards.",
        primaryCta: "Donate to a project",
        secondaryCta: "Explore programs"
      },
      impact: {
        title: "Our impact",
        subtitle: "Together, we are restoring thriving landscapes for wildlife and people.",
        metrics: {
          habitatRestore: "Habitat restored",
          speciesProtected: "Species monitored",
          communityPartners: "Community partners",
          treesPlanted: "Trees planted"
        }
      },
      programs: {
        title: "Conservation programs",
        viewAll: "View all programs"
      },
      stories: {
        title: "Stories from the field",
        readStory: "Read story"
      }
    },
    forms: {
      donation: {
        title: "Make a donation",
        subtitle: "Choose a conservation project and support the work you care about.",
        donorInfo: "Donor information",
        project: "Project",
        amount: "Donation amount",
        frequency: "Donation frequency",
        oneTime: "One-time",
        monthly: "Monthly",
        yearly: "Yearly",
        paymentMethod: "Payment method",
        card: "Credit or debit card",
        upi: "UPI",
        bankTransfer: "Bank transfer",
        currency: "Currency",
        personalDetails: "Personal details",
        fullName: "Full name",
        email: "Email address",
        phone: "Phone number",
        country: "Country",
        address: "Street address",
        city: "City",
        postalCode: "Postal code",
        donateNow: "Donate now",
        donationAmountPlaceholder: "Enter donation amount",
        privacyNote: "Your information is protected and used only to process this donation.",
        validation: {
          nameRequired: "Full name is required.",
          emailRequired: "Email address is required.",
          emailInvalid: "Enter a valid email address.",
          phoneRequired: "Phone number is required.",
          phoneInvalid: "Enter a valid phone number.",
          amountRequired: "Choose or enter a donation amount.",
          amountMin: "Donation amount must be at least ₹100.",
          projectRequired: "Please choose a conservation project.",
          paymentRequired: "Choose a payment method."
        }
      },
      volunteer: {
        title: "Volunteer with Wild Haven",
        subtitle: "Join a field or community conservation team.",
        firstName: "First name",
        lastName: "Last name",
        email: "Email address",
        phone: "Phone number",
        skills: "Skills or areas of interest",
        availability: "Availability",
        location: "Preferred project location",
        consent: "I agree to be contacted by the Wild Haven team.",
        submit: "Join the team",
        validation: {
          firstNameRequired: "First name is required.",
          lastNameRequired: "Last name is required.",
          emailRequired: "Email address is required.",
          emailInvalid: "Enter a valid email address.",
          phoneRequired: "Phone number is required.",
          skillsRequired: "Please share your skills or area of interest."
        }
      },
      contact: {
        title: "Contact us",
        subtitle: "Ask a question or speak to our conservation team.",
        name: "Name",
        email: "Email address",
        phone: "Phone number",
        subject: "Subject",
        message: "Message",
        send: "Send message",
        validation: {
          nameRequired: "Name is required.",
          emailRequired: "Email address is required.",
          emailInvalid: "Enter a valid email address.",
          messageRequired: "Message is required."
        }
      }
    },
    payment: {
      title: "Secure payment",
      chooseMethod: "Choose a payment method",
      cardDetails: "Card details",
      cardholderName: "Cardholder name",
      cardNumber: "Card number",
      expiry: "Expiry",
      cvv: "CVV",
      upiId: "UPI ID",
      bankTransfer: "Bank transfer",
      review: "Review donation",
      payNow: "Pay now",
      processing: "Processing payment",
      paymentSuccess: "Donation complete",
      paymentSuccessMessage: "Thank you for helping protect wildlife and habitats.",
      paymentError: "Payment could not be completed",
      retry: "Retry payment",
      cancel: "Cancel payment"
    },
    modal: {
      close: "Close",
      confirm: "Confirm",
      confirmAction: "Confirm action",
      cancel: "Cancel",
      deleteConfirm: "Are you sure you want to delete this item?",
      donationConfirm: "Your donation will help fund this project.",
      welcome: "Welcome to Wild Haven",
      saved: "Saved successfully"
    },
    tooltips: {
      projectExplorer: "Explore conservation programs",
      donationImpact: "See how your donation supports field impact",
      volunteerSignup: "Sign up to join conservation work",
      contactSupport: "Contact the Wild Haven support team",
      locationMap: "Explore project locations"
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      network: "Network connection failed. Check your connection and try again.",
      validation: "Please review the highlighted fields.",
      sessionExpired: "Your session has expired. Please log in again.",
      missingData: "The requested information is not available.",
      emailExists: "This email address is already registered.",
      paymentDeclined: "Payment was declined by the bank or provider.",
      permissions: "You do not have permission to perform this action."
    },
    empty: {
      projects: "No conservation programs found.",
      donations: "No donation activity yet.",
      volunteers: "No volunteers yet.",
      records: "No records are available.",
      impact: "Impact data will appear here."
    },
    toast: {
      donationSaved: "Donation submitted successfully.",
      donationFailed: "Donation could not be submitted.",
      volunteerSaved: "Volunteer signup submitted successfully.",
      volunteerFailed: "Volunteer signup could not be submitted.",
      contactSaved: "Message sent successfully.",
      contactFailed: "Message could not be sent.",
      paymentSaved: "Payment confirmed.",
      warning: "Review outstanding information before continuing.",
      info: "Information updated."
    },
    email: {
      subject: {
        donationReceipt: "Wild Haven donation receipt",
        volunteerWelcome: "Welcome to the Wild Haven volunteer network",
        contactResponse: "Thank you for contacting Wild Haven",
        passwordReset: "Reset your Wild Haven password",
        paymentConfirmation: "Your payment is confirmed"
      },
      greeting: "Hello",
      signature: "Warm regards,\nThe Wild Haven Team",
      donationReceipt: {
        heading: "Thank you for your donation",
        body: "Your generous support will help protect wildlife and restore habitat."
      },
      volunteerWelcome: {
        heading: "Welcome to Wild Haven",
        body: "Thank you for joining our conservation team. We will contact you soon with next steps."
      },
      contactResponse: {
        heading: "We received your message",
        body: "Thank you for contacting Wild Haven. A team member will respond soon."
      }
    },
    admin: {
      dashboard: "Dashboard",
      reports: "Reports",
      users: "Users",
      campaigns: "Campaigns",
      programs: "Programs",
      transactions: "Transactions",
      settings: "Settings",
      analytics: "Analytics",
      export: "Export",
      download: "Download",
      createProject: "Create project",
      updateProject: "Update project",
      deleteProject: "Delete project"
    }
  },
  es: {
    app: {
      name: "Wild Haven",
      tagline: "Red de conservación de vida silvestre",
      language: "Español",
      locale: "es-ES"
    },
    navigation: {
      home: "Inicio",
      programs: "Programas",
      impact: "Impacto",
      donors: "Donantes",
      volunteer: "Voluntariado",
      contact: "Contacto",
      donate: "Donar",
      dashboard: "Panel",
      login: "Iniciar sesión",
      signup: "Registrarse",
      profile: "Mi perfil",
      admin: "Administración",
      resources: "Recursos",
      stories: "Historias",
      careers: "Carreras"
    },
    common: {
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      continue: "Continuar",
      back: "Atrás",
      next: "Siguiente",
      submit: "Enviar",
      update: "Actualizar",
      delete: "Eliminar",
      edit: "Editar",
      view: "Ver",
      search: "Buscar",
      filter: "Filtrar",
      loading: "Cargando",
      success: "Éxito",
      error: "Error",
      warning: "Advertencia",
      info: "Información",
      required: "Requerido",
      optional: "Opcional",
      learnMore: "Más información",
      all: "Todo",
      status: "Estado",
      date: "Fecha",
      amount: "Monto",
      currency: "Moneda",
      yes: "Sí",
      no: "No",
      notAvailable: "No disponible"
    },
    landing: {
      hero: {
        eyebrow: "Conservación de vida silvestre",
        title: "Protegemos hábitats. Empoderamos comunidades.",
        subtitle: "Cada contribución restaura hábitats, protege especies y apoya a los guardianes locales.",
        primaryCta: "Donar a un proyecto",
        secondaryCta: "Explorar programas"
      },
      impact: {
        title: "Nuestro impacto",
        subtitle: "Juntos estamos restaurando paisajes prósperos para la vida silvestre y las personas.",
        metrics: {
          habitatRestore: "Hábitat restaurado",
          speciesProtected: "Especies monitoreadas",
          communityPartners: "Socios comunitarios",
          treesPlanted: "Árboles plantados"
        }
      },
      programs: {
        title: "Programas de conservación",
        viewAll: "Ver todos los programas"
      },
      stories: {
        title: "Historias del campo",
        readStory: "Leer historia"
      }
    },
    forms: {
      donation: {
        title: "Hacer una donación",
        subtitle: "Elija un proyecto de conservación y apoye el trabajo que le importa.",
        donorInfo: "Información del donante",
        project: "Proyecto",
        amount: "Monto de la donación",
        frequency: "Frecuencia de donación",
        oneTime: "Única",
        monthly: "Mensual",
        yearly: "Anual",
        paymentMethod: "Método de pago",
        card: "Tarjeta de crédito o débito",
        upi: "UPI",
        bankTransfer: "Transferencia bancaria",
        currency: "Moneda",
        personalDetails: "Detalles personales",
        fullName: "Nombre completo",
        email: "Correo electrónico",
        phone: "Número de teléfono",
        country: "País",
        address: "Dirección",
        city: "Ciudad",
        postalCode: "Código postal",
        donateNow: "Donar ahora",
        donationAmountPlaceholder: "Ingrese el monto de la donación",
        privacyNote: "Su información está protegida y se usa solo para procesar esta donación.",
        validation: {
          nameRequired: "Se requiere el nombre completo.",
          emailRequired: "Se requiere un correo electrónico.",
          emailInvalid: "Ingrese un correo electrónico válido.",
          phoneRequired: "Se requiere un número de teléfono.",
          phoneInvalid: "Ingrese un número de teléfono válido.",
          amountRequired: "Elija o ingrese un monto de donación.",
          amountMin: "El monto de la donación debe ser al menos 100.",
          projectRequired: "Elija un proyecto de conservación.",
          paymentRequired: "Elija un método de pago."
        }
      },
      volunteer: {
        title: "Sea voluntario en Wild Haven",
        subtitle: "Únase a un equipo de conservación comunitaria o de campo.",
        firstName: "Nombre",
        lastName: "Apellido",
        email: "Correo electrónico",
        phone: "Número de teléfono",
        skills: "Habilidades o áreas de interés",
        availability: "Disponibilidad",
        location: "Ubicación preferida del proyecto",
        consent: "Acepto que el equipo de Wild Haven se comunique conmigo.",
        submit: "Unirse al equipo",
        validation: {
          firstNameRequired: "Se requiere el nombre.",
          lastNameRequired: "Se requiere el apellido.",
          emailRequired: "Se requiere un correo electrónico.",
          emailInvalid: "Ingrese un correo válido.",
          phoneRequired: "Se requiere un número de teléfono.",
          skillsRequired: "Comparta sus habilidades o área de interés."
        }
      },
      contact: {
        title: "Contáctenos",
        subtitle: "Haga una pregunta o hable con nuestro equipo de conservación.",
        name: "Nombre",
        email: "Correo electrónico",
        phone: "Número de teléfono",
        subject: "Asunto",
        message: "Mensaje",
        send: "Enviar mensaje",
        validation: {
          nameRequired: "Se requiere el nombre.",
          emailRequired: "Se requiere un correo electrónico.",
          emailInvalid: "Ingrese un correo electrónico válido.",
          messageRequired: "Se requiere un mensaje."
        }
      }
    },
    payment: {
      title: "Pago seguro",
      chooseMethod: "Elija un método de pago",
      cardDetails: "Detalles de la tarjeta",
      cardholderName: "Nombre del titular",
      cardNumber: "Número de tarjeta",
      expiry: "Vencimiento",
      cvv: "CVV",
      upiId: "ID UPI",
      bankTransfer: "Transferencia bancaria",
      review: "Revisar donación",
      payNow: "Pagar ahora",
      processing: "Procesando pago",
      paymentSuccess: "Donación completada",
      paymentSuccessMessage: "Gracias por ayudar a proteger la vida silvestre y los hábitats.",
      paymentError: "No se pudo completar el pago",
      retry: "Reintentar pago",
      cancel: "Cancelar pago"
    },
    modal: {
      close: "Cerrar",
      confirm: "Confirmar",
      confirmAction: "Confirmar acción",
      cancel: "Cancelar",
      deleteConfirm: "¿Está seguro de que desea eliminar este elemento?",
      donationConfirm: "Su donación ayudará a financiar este proyecto.",
      welcome: "Bienvenido a Wild Haven",
      saved: "Guardado correctamente"
    },
    tooltips: {
      projectExplorer: "Explorar programas de conservación",
      donationImpact: "Vea cómo su donación apoya el impacto de campo",
      volunteerSignup: "Regístrese para unirse al trabajo de conservación",
      contactSupport: "Contacte al equipo de soporte de Wild Haven",
      locationMap: "Explorar ubicaciones del proyecto"
    },
    errors: {
      generic: "Algo salió mal. Inténtelo de nuevo.",
      network: "La conexión de red falló. Compruebe su conexión e inténtelo de nuevo.",
      validation: "Revise los campos resaltados.",
      sessionExpired: "Su sesión ha expirado. Inicie sesión nuevamente.",
      missingData: "La información solicitada no está disponible.",
      emailExists: "Este correo electrónico ya está registrado.",
      paymentDeclined: "El pago fue rechazado por el banco o proveedor.",
      permissions: "No tiene permiso para realizar esta acción."
    },
    empty: {
      projects: "No se encontraron programas de conservación.",
      donations: "Aún no hay actividad de donaciones.",
      volunteers: "Aún no hay voluntarios.",
      records: "No hay registros disponibles.",
      impact: "Los datos de impacto aparecerán aquí."
    },
    toast: {
      donationSaved: "Donación enviada correctamente.",
      donationFailed: "No se pudo enviar la donación.",
      volunteerSaved: "La inscripción de voluntariado fue enviada correctamente.",
      volunteerFailed: "No se pudo enviar la inscripción de voluntariado.",
      contactSaved: "Mensaje enviado correctamente.",
      contactFailed: "No se pudo enviar el mensaje.",
      paymentSaved: "Pago confirmado.",
      warning: "Revise la información pendiente antes de continuar.",
      info: "Información actualizada."
    },
    email: {
      subject: {
        donationReceipt: "Recibo de donación de Wild Haven",
        volunteerWelcome: "Bienvenido a la red de voluntariado de Wild Haven",
        contactResponse: "Gracias por contactar a Wild Haven",
        passwordReset: "Restablezca su contraseña de Wild Haven",
        paymentConfirmation: "Su pago está confirmado"
      },
      greeting: "Hola",
      signature: "Saludos cordiales,\nEl equipo de Wild Haven",
      donationReceipt: {
        heading: "Gracias por su donación",
        body: "Su generosa contribución ayudará a proteger la vida silvestre y restaurar el hábitat."
      },
      volunteerWelcome: {
        heading: "Bienvenido a Wild Haven",
        body: "Gracias por unirse a nuestro equipo de conservación. Pronto nos pondremos en contacto con usted para los próximos pasos."
      },
      contactResponse: {
        heading: "Hemos recibido su mensaje",
        body: "Gracias por contactar a Wild Haven. Un miembro del equipo responderá pronto."
      }
    },
    admin: {
      dashboard: "Panel",
      reports: "Informes",
      users: "Usuarios",
      campaigns: "Campañas",
      programs: "Programas",
      transactions: "Transacciones",
      settings: "Configuración",
      analytics: "Analítica",
      export: "Exportar",
      download: "Descargar",
      createProject: "Crear proyecto",
      updateProject: "Actualizar proyecto",
      deleteProject: "Eliminar proyecto"
    }
  },
  fr: {
    app: {
      name: "Wild Haven",
      tagline: "Réseau de conservation de la faune",
      language: "Français",
      locale: "fr-FR"
    },
    navigation: {
      home: "Accueil",
      programs: "Programmes",
      impact: "Impact",
      donors: "Donateurs",
      volunteer: "Bénévolat",
      contact: "Contact",
      donate: "Faire un don",
      dashboard: "Tableau de bord",
      login: "Connexion",
      signup: "Créer un compte",
      profile: "Mon profil",
      admin: "Administration",
      resources: "Ressources",
      stories: "Histoires",
      careers: "Carrières"
    },
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      continue: "Continuer",
      back: "Retour",
      next: "Suivant",
      submit: "Soumettre",
      update: "Mettre à jour",
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      search: "Rechercher",
      filter: "Filtrer",
      loading: "Chargement",
      success: "Succès",
      error: "Erreur",
      warning: "Avertissement",
      info: "Informations",
      required: "Requis",
      optional: "Optionnel",
      learnMore: "En savoir plus",
      all: "Tout",
      status: "Statut",
      date: "Date",
      amount: "Montant",
      currency: "Devise",
      yes: "Oui",
      no: "Non",
      notAvailable: "Indisponible"
    },
    landing: {
      hero: {
        eyebrow: "Conservation de la faune",
        title: "Protéger les habitats. Donner du pouvoir aux communautés.",
        subtitle: "Chaque contribution restaure l’habitat, protège les espèces et soutient les gestionnaires locaux.",
        primaryCta: "Faire un don à un projet",
        secondaryCta: "Explorer les programmes"
      },
      impact: {
        title: "Notre impact",
        subtitle: "Ensemble, nous restaurons des paysages florissants pour la faune et les gens.",
        metrics: {
          habitatRestore: "Habitat restauré",
          speciesProtected: "Espèces suivies",
          communityPartners: "Partenaires communautaires",
          treesPlanted: "Arbres plantés"
        }
      },
      programs: {
        title: "Programmes de conservation",
        viewAll: "Voir tous les programmes"
      },
      stories: {
        title: "Histoires de terrain",
        readStory: "Lire l’histoire"
      }
    },
    forms: {
      donation: {
        title: "Faire un don",
        subtitle: "Choisissez un projet de conservation et soutenez le travail qui vous tient à cœur.",
        donorInfo: "Informations du donateur",
        project: "Projet",
        amount: "Montant du don",
        frequency: "Fréquence du don",
        oneTime: "Unique",
        monthly: "Mensuel",
        yearly: "Annuel",
        paymentMethod: "Méthode de paiement",
        card: "Carte bancaire",
        upi: "UPI",
        bankTransfer: "Virement bancaire",
        currency: "Devise",
        personalDetails: "Détails personnels",
        fullName: "Nom complet",
        email: "Adresse e-mail",
        phone: "Téléphone",
        country: "Pays",
        address: "Adresse",
        city: "Ville",
        postalCode: "Code postal",
        donateNow: "Faire un don",
        donationAmountPlaceholder: "Entrez le montant du don",
        privacyNote: "Vos informations sont protégées et utilisées uniquement pour traiter ce don.",
        validation: {
          nameRequired: "Le nom complet est requis.",
          emailRequired: "L’adresse e-mail est requise.",
          emailInvalid: "Entrez une adresse e-mail valide.",
          phoneRequired: "Le numéro de téléphone est requis.",
          phoneInvalid: "Entrez un numéro de téléphone valide.",
          amountRequired: "Choisissez ou entrez un montant de don.",
          amountMin: "Le montant du don doit être au moins de 100.",
          projectRequired: "Veuillez choisir un projet de conservation.",
          paymentRequired: "Choisissez un mode de paiement."
        }
      },
      volunteer: {
        title: "Devenir bénévole chez Wild Haven",
        subtitle: "Rejoignez une équipe de conservation de terrain ou communautaire.",
        firstName: "Prénom",
        lastName: "Nom",
        email: "Adresse e-mail",
        phone: "Téléphone",
        skills: "Compétences ou centres d’intérêt",
        availability: "Disponibilité",
        location: "Lieu de projet préféré",
        consent: "J’accepte d’être contacté par l’équipe de Wild Haven.",
        submit: "Rejoindre l’équipe",
        validation: {
          firstNameRequired: "Le prénom est requis.",
          lastNameRequired: "Le nom de famille est requis.",
          emailRequired: "L’adresse e-mail est requise.",
          emailInvalid: "Entrez une adresse e-mail valide.",
          phoneRequired: "Le numéro de téléphone est requis.",
          skillsRequired: "Veuillez indiquer vos compétences ou vos centres d’intérêt."
        }
      },
      contact: {
        title: "Nous contacter",
        subtitle: "Posez une question ou parlez à notre équipe de conservation.",
        name: "Nom",
        email: "Adresse e-mail",
        phone: "Téléphone",
        subject: "Objet",
        message: "Message",
        send: "Envoyer le message",
        validation: {
          nameRequired: "Le nom est requis.",
          emailRequired: "L’adresse e-mail est requise.",
          emailInvalid: "Entrez une adresse e-mail valide.",
          messageRequired: "Le message est requis."
        }
      }
    },
    payment: {
      title: "Paiement sécurisé",
      chooseMethod: "Choisissez un mode de paiement",
      cardDetails: "Détails de carte",
      cardholderName: "Nom du titulaire",
      cardNumber: "Numéro de carte",
      expiry: "Expiration",
      cvv: "CVV",
      upiId: "Identifiant UPI",
      bankTransfer: "Virement bancaire",
      review: "Vérifier le don",
      payNow: "Payer maintenant",
      processing: "Traitement du paiement",
      paymentSuccess: "Don effectué",
      paymentSuccessMessage: "Merci d’aider à protéger la faune et les habitats.",
      paymentError: "Le paiement n’a pas pu être effectué",
      retry: "Réessayer le paiement",
      cancel: "Annuler le paiement"
    },
    modal: {
      close: "Fermer",
      confirm: "Confirmer",
      confirmAction: "Confirmer l’action",
      cancel: "Annuler",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer cet élément ?",
      donationConfirm: "Votre don aidera à financer ce projet.",
      welcome: "Bienvenue chez Wild Haven",
      saved: "Enregistré avec succès"
    },
    tooltips: {
      projectExplorer: "Explorer les programmes de conservation",
      donationImpact: "Voir comment votre don soutient l’impact sur le terrain",
      volunteerSignup: "Inscrivez-vous pour rejoindre les actions de conservation",
      contactSupport: "Contacter l’équipe d’assistance de Wild Haven",
      locationMap: "Explorer les lieux des projets"
    },
    errors: {
      generic: "Une erreur s’est produite. Veuillez réessayer.",
      network: "La connexion réseau a échoué. Vérifiez votre connexion et réessayez.",
      validation: "Veuillez vérifier les champs surlignés.",
      sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
      missingData: "Les informations demandées ne sont pas disponibles.",
      emailExists: "Cette adresse e-mail est déjà enregistrée.",
      paymentDeclined: "Le paiement a été refusé par la banque ou le fournisseur.",
      permissions: "Vous n’avez pas la permission d’effectuer cette action."
    },
    empty: {
      projects: "Aucun programme de conservation trouvé.",
      donations: "Aucune activité de don pour le moment.",
      volunteers: "Aucun bénévole pour le moment.",
      records: "Aucun enregistrement disponible.",
      impact: "Les données d’impact apparaîtront ici."
    },
    toast: {
      donationSaved: "Don soumis avec succès.",
      donationFailed: "Le don n’a pas pu être soumis.",
      volunteerSaved: "L’inscription au bénévolat a été soumise avec succès.",
      volunteerFailed: "L’inscription au bénévolat n’a pas pu être soumise.",
      contactSaved: "Message envoyé avec succès.",
      contactFailed: "Le message n’a pas pu être envoyé.",
      paymentSaved: "Paiement confirmé.",
      warning: "Veuillez vérifier les informations en attente avant de continuer.",
      info: "Informations mises à jour."
    },
    email: {
      subject: {
        donationReceipt: "Reçu de don Wild Haven",
        volunteerWelcome: "Bienvenue dans le réseau des bénévoles Wild Haven",
        contactResponse: "Merci d’avoir contacté Wild Haven",
        passwordReset: "Réinitialisez votre mot de passe Wild Haven",
        paymentConfirmation: "Votre paiement est confirmé"
      },
      greeting: "Bonjour",
      signature: "Cordialement,\nL’équipe Wild Haven",
      donationReceipt: {
        heading: "Merci pour votre don",
        body: "Votre généreux soutien aidera à protéger la faune et à restaurer les habitats."
      },
      volunteerWelcome: {
        heading: "Bienvenue chez Wild Haven",
        body: "Merci de rejoindre notre équipe de conservation. Nous vous contacterons bientôt pour les prochaines étapes."
      },
      contactResponse: {
        heading: "Nous avons reçu votre message",
        body: "Merci d’avoir contacté Wild Haven. Un membre de l’équipe vous répondra bientôt."
      }
    },
    admin: {
      dashboard: "Tableau de bord",
      reports: "Rapports",
      users: "Utilisateurs",
      campaigns: "Campagnes",
      programs: "Programmes",
      transactions: "Transactions",
      settings: "Paramètres",
      analytics: "Analytique",
      export: "Exporter",
      download: "Télécharger",
      createProject: "Créer un projet",
      updateProject: "Mettre à jour le projet",
      deleteProject: "Supprimer le projet"
    }
  },
  de: {
    app: {
      name: "Wild Haven",
      tagline: "Wildtier-Konservierungsnetzwerk",
      language: "Deutsch",
      locale: "de-DE"
    },
    navigation: {
      home: "Startseite",
      programs: "Programme",
      impact: "Einsatz",
      donors: "Spender",
      volunteer: "Freiwillige",
      contact: "Kontakt",
      donate: "Spenden",
      dashboard: "Dashboard",
      login: "Anmelden",
      signup: "Registrieren",
      profile: "Mein Profil",
      admin: "Admin",
      resources: "Ressourcen",
      stories: "Geschichten",
      careers: "Karrieren"
    },
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      close: "Schließen",
      continue: "Weiter",
      back: "Zurück",
      next: "Weiter",
      submit: "Senden",
      update: "Aktualisieren",
      delete: "Löschen",
      edit: "Bearbeiten",
      view: "Ansehen",
      search: "Suchen",
      filter: "Filtern",
      loading: "Lädt",
      success: "Erfolg",
      error: "Fehler",
      warning: "Warnung",
      info: "Information",
      required: "Erforderlich",
      optional: "Optional",
      learnMore: "Mehr erfahren",
      all: "Alle",
      status: "Status",
      date: "Datum",
      amount: "Betrag",
      currency: "Währung",
      yes: "Ja",
      no: "Nein",
      notAvailable: "Nicht verfügbar"
    },
    landing: {
      hero: {
        eyebrow: "Wildtierkonservierung",
        title: "Lebensräume schützen. Gemeinschaften stärken.",
        subtitle: "Jeder Beitrag stellt Lebensräume wieder her, schützt Arten und unterstützt lokale Experten.",
        primaryCta: "Projekt spenden",
        secondaryCta: "Programme entdecken"
      },
      impact: {
        title: "Unsere Wirkung",
        subtitle: "Gemeinsam stellen wir lebensfähige Landschaften für Wildtiere und Menschen wieder her.",
        metrics: {
          habitatRestore: "Wiederhergestellte Habitate",
          speciesProtected: "Überwachte Arten",
          communityPartners: "Gemeinschaftspartner",
          treesPlanted: "Pflanzungen"
        }
      },
      programs: {
        title: "Naturschutzprogramme",
        viewAll: "Alle Programme ansehen"
      },
      stories: {
        title: "Geschichten aus dem Einsatz",
        readStory: "Geschichte lesen"
      }
    },
    forms: {
      donation: {
        title: "Spende machen",
        subtitle: "Wählen Sie ein Naturschutzprojekt und unterstützen Sie die Arbeit, die Ihnen wichtig ist.",
        donorInfo: "Spenderinformationen",
        project: "Projekt",
        amount: "Spendenbetrag",
        frequency: "Spendenfrequenz",
        oneTime: "Einmalig",
        monthly: "Monatlich",
        yearly: "Jährlich",
        paymentMethod: "Zahlungsmethode",
        card: "Kredit- oder Debitkarte",
        upi: "UPI",
        bankTransfer: "Banküberweisung",
        currency: "Währung",
        personalDetails: "Persönliche Angaben",
        fullName: "Vollständiger Name",
        email: "E-Mail-Adresse",
        phone: "Telefonnummer",
        country: "Land",
        address: "Straße",
        city: "Stadt",
        postalCode: "Postleitzahl",
        donateNow: "Jetzt spenden",
        donationAmountPlaceholder: "Spendenbetrag eingeben",
        privacyNote: "Ihre Informationen werden geschützt und nur zur Bearbeitung dieser Spende verwendet.",
        validation: {
          nameRequired: "Vollständiger Name ist erforderlich.",
          emailRequired: "E-Mail-Adresse ist erforderlich.",
          emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
          phoneRequired: "Telefonnummer ist erforderlich.",
          phoneInvalid: "Geben Sie eine gültige Telefonnummer ein.",
          amountRequired: "Wählen oder geben Sie einen Spendenbetrag ein.",
          amountMin: "Der Spendenbetrag muss mindestens 100 betragen.",
          projectRequired: "Bitte wählen Sie ein Naturschutzprojekt.",
          paymentRequired: "Wählen Sie eine Zahlungsmethode."
        }
      },
      volunteer: {
        title: "Bei Wild Haven ehrenamtlich tätig werden",
        subtitle: "Melden Sie sich bei einem Naturschutzvorhaben oder einer Gemeinschaftsgruppe an.",
        firstName: "Vorname",
        lastName: "Nachname",
        email: "E-Mail-Adresse",
        phone: "Telefonnummer",
        skills: "Fähigkeiten oder Interessen",
        availability: "Verfügbarkeit",
        location: "Bevorzugter Projektstandort",
        consent: "Ich bin damit einverstanden, dass mich das Wild Haven Team kontaktiert.",
        submit: "Dem Team beitreten",
        validation: {
          firstNameRequired: "Vorname ist erforderlich.",
          lastNameRequired: "Nachname ist erforderlich.",
          emailRequired: "E-Mail-Adresse ist erforderlich.",
          emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
          phoneRequired: "Telefonnummer ist erforderlich.",
          skillsRequired: "Bitte geben Sie Ihre Fähigkeiten oder Ihr Interessengebiet an."
        }
      },
      contact: {
        title: "Kontaktieren Sie uns",
        subtitle: "Stellen Sie eine Frage oder sprechen Sie mit unserem Naturschutzteam.",
        name: "Name",
        email: "E-Mail-Adresse",
        phone: "Telefonnummer",
        subject: "Betreff",
        message: "Nachricht",
        send: "Nachricht senden",
        validation: {
          nameRequired: "Name ist erforderlich.",
          emailRequired: "E-Mail-Adresse ist erforderlich.",
          emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
          messageRequired: "Nachricht ist erforderlich."
        }
      }
    },
    payment: {
      title: "Sichere Zahlung",
      chooseMethod: "Zahlungsmethode wählen",
      cardDetails: "Kartendetails",
      cardholderName: "Karteninhaber",
      cardNumber: "Kartennummer",
      expiry: "Ablaufdatum",
      cvv: "CVV",
      upiId: "UPI-ID",
      bankTransfer: "Banküberweisung",
      review: "Spende prüfen",
      payNow: "Jetzt bezahlen",
      processing: "Zahlung wird verarbeitet",
      paymentSuccess: "Spende abgeschlossen",
      paymentSuccessMessage: "Vielen Dank, dass Sie Wildtiere und Lebensräume schützen helfen.",
      paymentError: "Zahlung konnte nicht abgeschlossen werden",
      retry: "Zahlung erneut versuchen",
      cancel: "Zahlung abbrechen"
    },
    modal: {
      close: "Schließen",
      confirm: "Bestätigen",
      confirmAction: "Aktion bestätigen",
      cancel: "Abbrechen",
      deleteConfirm: "Möchten Sie dieses Element wirklich löschen?",
      donationConfirm: "Ihre Spende unterstützt dieses Projekt.",
      welcome: "Willkommen bei Wild Haven",
      saved: "Erfolgreich gespeichert"
    },
    tooltips: {
      projectExplorer: "Naturschutzprogramme erkunden",
      donationImpact: "Erfahren Sie, wie Ihre Spende vor Ort wirkt",
      volunteerSignup: "Melden Sie sich an, um bei der Naturschutzarbeit zu helfen",
      contactSupport: "Kontaktieren Sie das Wild Haven Support-Team",
      locationMap: "Projektstandorte erkunden"
    },
    errors: {
      generic: "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
      network: "Netzwerkverbindung fehlgeschlagen. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      validation: "Bitte prüfen Sie die hervorgehobenen Felder.",
      sessionExpired: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      missingData: "Die angeforderten Informationen sind nicht verfügbar.",
      emailExists: "Diese E-Mail-Adresse ist bereits registriert.",
      paymentDeclined: "Die Zahlung wurde von der Bank oder dem Anbieter abgelehnt.",
      permissions: "Sie haben keine Berechtigung, diese Aktion auszuführen."
    },
    empty: {
      projects: "Keine Naturschutzprogramme gefunden.",
      donations: "Noch keine Spendenaktivitäten.",
      volunteers: "Noch keine Freiwilligen.",
      records: "Keine Datensätze verfügbar.",
      impact: "Auswirkungsdaten erscheinen hier."
    },
    toast: {
      donationSaved: "Spende erfolgreich übermittelt.",
      donationFailed: "Spende konnte nicht übermittelt werden.",
      volunteerSaved: "Freiwilligenanmeldung erfolgreich übermittelt.",
      volunteerFailed: "Freiwilligenanmeldung konnte nicht übermittelt werden.",
      contactSaved: "Nachricht erfolgreich gesendet.",
      contactFailed: "Nachricht konnte nicht gesendet werden.",
      paymentSaved: "Zahlung bestätigt.",
      warning: "Bitte prüfen Sie die offenen Informationen, bevor Sie fortfahren.",
      info: "Information aktualisiert."
    },
    email: {
      subject: {
        donationReceipt: "Wild Haven Spendenquittung",
        volunteerWelcome: "Willkommen im Wild Haven Freiwilligen-Netzwerk",
        contactResponse: "Vielen Dank für Ihre Nachricht an Wild Haven",
        passwordReset: "Passwort für Wild Haven zurücksetzen",
        paymentConfirmation: "Ihre Zahlung wurde bestätigt"
      },
      greeting: "Hallo",
      signature: "Mit freundlichen Grüßen,\nDas Wild Haven Team",
      donationReceipt: {
        heading: "Vielen Dank für Ihre Spende",
        body: "Ihre großzügige Unterstützung hilft dabei, Wildtiere zu schützen und Lebensräume wiederherzustellen."
      },
      volunteerWelcome: {
        heading: "Willkommen bei Wild Haven",
        body: "Vielen Dank, dass Sie unserem Naturschutzteam beitreten. Wir melden uns bald mit den nächsten Schritten."
      },
      contactResponse: {
        heading: "Wir haben Ihre Nachricht erhalten",
        body: "Vielen Dank, dass Sie Wild Haven kontaktiert haben. Ein Teammitglied wird sich bald bei Ihnen melden."
      }
    },
    admin: {
      dashboard: "Dashboard",
      reports: "Berichte",
      users: "Benutzer",
      campaigns: "Kampagnen",
      programs: "Programme",
      transactions: "Transaktionen",
      settings: "Einstellungen",
      analytics: "Analytik",
      export: "Exportieren",
      download: "Herunterladen",
      createProject: "Projekt erstellen",
      updateProject: "Projekt aktualisieren",
      deleteProject: "Projekt löschen"
    }
  },
  sw: {
    app: {
      name: "Wild Haven",
      tagline: "Mtandao wa uhifadhi wa wanyamapori",
      language: "Kiswahili",
      locale: "sw-KE"
    },
    navigation: {
      home: "Nyumbani",
      programs: "Mipango",
      impact: "Athari",
      donors: "Wafadhili",
      volunteer: "Kujitolea",
      contact: "Mawasiliano",
      donate: "Changia",
      dashboard: "Dashibodi",
      login: "Ingia",
      signup: "Jisajili",
      profile: "Profaili yangu",
      admin: "Usimamizi",
      resources: "Rasilimali",
      stories: "Hadithi",
      careers: "Kazi"
    },
    common: {
      save: "Hifadhi",
      cancel: "Ghairi",
      close: "Funga",
      continue: "Endelea",
      back: "Rudi",
      next: "Ifuatayo",
      submit: "Tuma",
      update: "Sasisha",
      delete: "Futa",
      edit: "Badilisha",
      view: "Tazama",
      search: "Tafuta",
      filter: "Chuja",
      loading: "Inapakia",
      success: "Mafanikio",
      error: "Kosa",
      warning: "Onyo",
      info: "Taarifa",
      required: "Inahitajika",
      optional: "Hiari",
      learnMore: "Jifunze zaidi",
      all: "Zote",
      status: "Hali",
      date: "Tarehe",
      amount: "Kiasi",
      currency: "Sarafu",
      yes: "Ndiyo",
      no: "Hapana",
      notAvailable: "Haipatikani"
    },
    landing: {
      hero: {
        eyebrow: "Uhifadhi wa wanyamapori",
        title: "Kulinda makazi. Kuwapa nguvu jamii.",
        subtitle: "Kipato chochote kinarejesha makazi, kulinda spishi na kusaidia wataalamu wa jamii.",
        primaryCta: "Changia mradi",
        secondaryCta: "Chunguza mipango"
      },
      impact: {
        title: "Athari yetu",
        subtitle: "Pamoja, tunarejesha maeneo yenye utulivu kwa wanyamapori na watu.",
        metrics: {
          habitatRestore: "Makazi yarejeshwa",
          speciesProtected: "Spishi zinazofuatiliwa",
          communityPartners: "Washirika wa jamii",
          treesPlanted: "Miti iliyopandwa"
        }
      },
      programs: {
        title: "Mipango ya uhifadhi",
        viewAll: "Angalia mipango yote"
      },
      stories: {
        title: "Hadithi kutoka shambani",
        readStory: "Soma hadithi"
      }
    },
    forms: {
      donation: {
        title: "Fanya mchango",
        subtitle: "Chagua mradi wa uhifadhi na uunge mkono kazi inayokupenda.",
        donorInfo: "Taarifa za mfadhili",
        project: "Mradi",
        amount: "Kiasi cha mchango",
        frequency: "Mara ya mchango",
        oneTime: "Mara moja",
        monthly: "Kila mwezi",
        yearly: "Kila mwaka",
        paymentMethod: "Njia ya malipo",
        card: "Kadi ya mkopo au debit",
        upi: "UPI",
        bankTransfer: "Uhamishaji wa benki",
        currency: "Sarafu",
        personalDetails: "Taarifa binafsi",
        fullName: "Jina kamili",
        email: "Barua pepe",
        phone: "Namba ya simu",
        country: "Nchi",
        address: "Anwani",
        city: "Jiji",
        postalCode: "Msimbo wa posta",
        donateNow: "Changia sasa",
        donationAmountPlaceholder: "Ingiza kiasi cha mchango",
        privacyNote: "Taarifa yako inalindwa na inatumiwa kwa ajili ya kuchakata mchango huu pekee.",
        validation: {
          nameRequired: "Jina kamili linahitajika.",
          emailRequired: "Barua pepe inahitajika.",
          emailInvalid: "Ingiza barua pepe halali.",
          phoneRequired: "Namba ya simu inahitajika.",
          phoneInvalid: "Ingiza namba ya simu halali.",
          amountRequired: "Chagua au ingiza kiasi cha mchango.",
          amountMin: "Kiasi cha mchango lazima kiwe angalau 100.",
          projectRequired: "Tafadhali chagua mradi wa uhifadhi.",
          paymentRequired: "Chagua njia ya malipo."
        }
      },
      volunteer: {
        title: "Jitolee kwa Wild Haven",
        subtitle: "Jiunge na timu ya uhifadhi wa shamba au jamii.",
        firstName: "Jina la kwanza",
        lastName: "Jina la familia",
        email: "Barua pepe",
        phone: "Namba ya simu",
        skills: "Ustadi au maeneo ya kupendeza",
        availability: "Upatikanaji",
        location: "Mahali pa mradi unaopendelea",
        consent: "Nakubali kuwasiliana na timu ya Wild Haven.",
        submit: "Jiunge na timu",
        validation: {
          firstNameRequired: "Jina la kwanza linahitajika.",
          lastNameRequired: "Jina la familia linahitajika.",
          emailRequired: "Barua pepe inahitajika.",
          emailInvalid: "Ingiza barua pepe halali.",
          phoneRequired: "Namba ya simu inahitajika.",
          skillsRequired: "Tafadhali eleza ustadi au eneo la kupendeza."
        }
      },
      contact: {
        title: "Wasiliana nasi",
        subtitle: "Uliza swali au zungumza na timu yetu ya uhifadhi.",
        name: "Jina",
        email: "Barua pepe",
        phone: "Namba ya simu",
        subject: "Kichwa",
        message: "Ujumbe",
        send: "Tuma ujumbe",
        validation: {
          nameRequired: "Jina linahitajika.",
          emailRequired: "Barua pepe inahitajika.",
          emailInvalid: "Ingiza barua pepe halali.",
          messageRequired: "Ujumbe unahitajika."
        }
      }
    },
    payment: {
      title: "Malipo salama",
      chooseMethod: "Chagua njia ya malipo",
      cardDetails: "Taarifa za kadi",
      cardholderName: "Jina la mwenye kadi",
      cardNumber: "Namba ya kadi",
      expiry: "Muda wa mwisho",
      cvv: "CVV",
      upiId: "UPI ID",
      bankTransfer: "Uhamishaji wa benki",
      review: "Pitia mchango",
      payNow: "Lipa sasa",
      processing: "Inachakata malipo",
      paymentSuccess: "Mchango umekamilika",
      paymentSuccessMessage: "Asante kwa kusaidia kulinda wanyamapori na makazi.",
      paymentError: "Malipo hayakuweza kukamilika",
      retry: "Jaribu tena malipo",
      cancel: "Ghairi malipo"
    },
    modal: {
      close: "Funga",
      confirm: "Thibitisha",
      confirmAction: "Thibitisha hatua",
      cancel: "Ghairi",
      deleteConfirm: "Una uhakika unataka kufuta kipengee hiki?",
      donationConfirm: "Mchango wako utasaidia kufadhili mradi huu.",
      welcome: "Karibu Wild Haven",
      saved: "Imehifadhiwa vizuri"
    },
    tooltips: {
      projectExplorer: "Chunguza mipango ya uhifadhi",
      donationImpact: "Tazama jinsi mchango wako unavyosaidia athari ya shambani",
      volunteerSignup: "Jisajili ili ujiunge na kazi ya uhifadhi",
      contactSupport: "Wasiliana na timu ya usaidizi ya Wild Haven",
      locationMap: "Chunguza maeneo ya mradi"
    },
    errors: {
      generic: "Kitu kilikosekana. Tafadhali jaribu tena.",
      network: "Uunganisho wa mtandao umeshindwa. Angalia muunganisho wako na ujaribu tena.",
      validation: "Tafadhali angalia sehemu zilizotengwa.",
      sessionExpired: "Kipindi chako kimeisha. Tafadhali ingia tena.",
      missingData: "Taarifa inayohitajika haipatikani.",
      emailExists: "Barua pepe hii tayari imesajiliwa.",
      paymentDeclined: "Malipo yamekataliwa na benki au mtoa huduma.",
      permissions: "Huna ruhusa ya kufanya hatua hii."
    },
    empty: {
      projects: "Hakuna mipango ya uhifadhi iliyopatikana.",
      donations: "Hakuna shughuli za mchango bado.",
      volunteers: "Hakuna kujitolea bado.",
      records: "Hakuna rekodi zinazopatikana.",
      impact: "Taarifa za athari zitaonekana hapa."
    },
    toast: {
      donationSaved: "Mchango umetumwa kwa mafanikio.",
      donationFailed: "Mchango haukuweza kutumwa.",
      volunteerSaved: "Usajili wa kujitolea umetumwa kwa mafanikio.",
      volunteerFailed: "Usajili wa kujitolea haukuweza kutumwa.",
      contactSaved: "Ujumbe umetumwa kwa mafanikio.",
      contactFailed: "Ujumbe haukuweza kutumwa.",
      paymentSaved: "Malipo yamehakikishwa.",
      warning: "Tafadhali angalia taarifa za muda mfupi kabla ya kuendelea.",
      info: "Taarifa imesasishwa."
    },
    email: {
      subject: {
        donationReceipt: "Risiti ya mchango wa Wild Haven",
        volunteerWelcome: "Karibu kwenye mtandao wa kujitolea wa Wild Haven",
        contactResponse: "Asante kwa kuwasiliana na Wild Haven",
        passwordReset: "Badilisha neno lako la siri la Wild Haven",
        paymentConfirmation: "Malipo yako yamehakikishwa"
      },
      greeting: "Habari",
      signature: "Kwa heri,\nTimu ya Wild Haven",
      donationReceipt: {
        heading: "Asante kwa mchango wako",
        body: "Mchango wako wa neema utasaidia kulinda wanyamapori na kurejesha makazi."
      },
      volunteerWelcome: {
        heading: "Karibu Wild Haven",
        body: "Asante kwa kujiunga na timu yetu ya uhifadhi. Tutawasiliana nawe hivi karibuni kwa hatua zifuatazo."
      },
      contactResponse: {
        heading: "Tumepokea ujumbe wako",
        body: "Asante kwa kuwasiliana na Wild Haven. Mwanachama wa timu atajibu hivi karibuni."
      }
    },
    admin: {
      dashboard: "Dashibodi",
      reports: "Ripoti",
      users: "Watumiaji",
      campaigns: "Kampeni",
      programs: "Mipango",
      transactions: "Miamala",
      settings: "Mipangilio",
      analytics: "Uchanganuzi",
      export: "Hamisha",
      download: "Pakua",
      createProject: "Tengeneza mradi",
      updateProject: "Sasisha mradi",
      deleteProject: "Futa mradi"
    }
  }
};

module.exports = {
  localizationDictionary,
};
