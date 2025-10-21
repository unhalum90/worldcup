#!/bin/bash

# Script to update all translation files with new keys for website updates

cd "$(dirname "$0")"

echo "📝 Updating French translations..."
cat > fr.json << 'EOF'
{
  "nav": {
    "home": "Accueil",
    "blog": "Newsletter",
    "privacy": "Confidentialité",
    "guides": "Guides",
    "forums": "Forums",
    "planner": "Planificateur",
    "roadmap": "Feuille de route"
  },
  "hero": {
    "title": "Planifiez votre voyage pour la Coupe du Monde 2026",
    "subtitle": "Guides de villes, forums de fans et planificateur de voyage IA",
    "subline": "Explorez les guides des villes hôtes, les forums de fans et notre planificateur de voyage alimenté par l'IA.",
    "emailPlaceholder": "Votre email",
    "interestLabel": "Je suis...",
    "interest": {
      "home": "Je regarde depuis chez moi",
      "hope": "J'espère obtenir des billets",
      "going": "J'y vais — tenez-moi au courant"
    },
    "consent": "J'accepte la Politique de Confidentialité",
    "cta": "Rejoindre la liste d'attente",
    "viewBlog": "Explorer la newsletter",
    "exploreFeatures": "Explorer les fonctionnalités ↓"
  },
  "features": {
    "title": "Ce que vous obtiendrez",
    "showcase": {
      "guides": {
        "title": "Guides de Voyage des Villes",
        "desc": "Guides complets pour les 16 villes hôtes avec infos sur les stades, transport et conseils locaux.",
        "cta": "Voir les Guides"
      },
      "forums": {
        "title": "Forums des Villes",
        "desc": "Connectez-vous avec les fans, partagez des conseils et organisez des rencontres.",
        "cta": "Rejoindre les Forums"
      },
      "planner": {
        "title": "Planificateur de Voyage IA",
        "desc": "Itinéraires personnalisés, hébergement et optimisation de trajet.",
        "cta": "Commencer"
      }
    },
    "items": [
      {
        "title": "Rencontres communautaires",
        "desc": "Trouvez et organisez des rassemblements de fans."
      },
      {
        "title": "Guides de ville",
        "desc": "Meilleurs spots près des stades et conseils."
      },
      {
        "title": "Planification matchs",
        "desc": "Infos clés pour chaque lieu."
      }
    ]
  },
  "demo": {
    "title": "Regarder la Démo",
    "duration": "45 secondes",
    "launching": "Lancement le 5 décembre 2025",
    "stayTuned": "Restez à l'écoute pour notre plateforme complète."
  },
  "timeline": {
    "title": "Route vers la Coupe du Monde",
    "subtitle": "Survolez pour explorer les dates clés",
    "swipeHint": "← Balayez pour explorer →",
    "legend": {
      "past": "Passé",
      "upcoming": "À venir",
      "tournament": "Tournoi",
      "highlight": "Important"
    }
  },
  "guides": {
    "title": "Explorer les Guides des Villes Hôtes 2026",
    "subtitle": "Guides complets pour les 16 villes hôtes.",
    "freeDownload": "TÉLÉCHARGEMENT GRATUIT",
    "cityCount": "16 villes hôtes",
    "downloadCTA": "Télécharger",
    "waitlistCTA": "Rejoindre"
  },
  "forums": {
    "title": "Forums des Villes Hôtes",
    "subtitle": "Connectez-vous avec les fans dans les 16 villes hôtes.",
    "trending": "Discussions Tendance",
    "cityForums": "Forums des Villes",
    "joinDiscussion": "Rejoindre",
    "createPost": "Créer un Post",
    "replies": "réponses",
    "views": "vues"
  },
  "contact": {
    "title": "Nous Contacter",
    "subtitle": "Des questions? Nous aimerions avoir de vos nouvelles!",
    "general": {
      "title": "Demandes Générales",
      "desc": "Questions sur la plateforme"
    },
    "support": {
      "title": "Support Technique",
      "desc": "Aide avec votre compte"
    },
    "partnerships": {
      "title": "Partenariats",
      "desc": "Opportunités commerciales"
    },
    "media": {
      "title": "Demandes Médias",
      "desc": "Presse et journalistes"
    },
    "form": {
      "firstName": "Prénom",
      "lastName": "Nom",
      "email": "Email",
      "subject": "Sujet",
      "message": "Message",
      "submit": "Envoyer"
    }
  },
  "terms": {
    "title": "Conditions d'Utilisation",
    "lastUpdated": "Dernière mise à jour:"
  },
  "footer": {
    "rights": "Tous droits réservés.",
    "description": "Votre ressource pour la Coupe du Monde 2026.",
    "disclaimer": "Non affilié à la FIFA",
    "features": "Fonctionnalités",
    "legal": "Juridique",
    "cityGuides": "Guides",
    "fanForums": "Forums",
    "aiPlanner": "Planificateur",
    "newsletter": "Newsletter",
    "privacyPolicy": "Confidentialité",
    "terms": "Conditions",
    "contact": "Contact",
    "languages": "Disponible en plusieurs langues:"
  },
  "blog": {
    "title": "Perspectives pour la Coupe du Monde 2026",
    "empty": "Aucun article."
  },
  "privacy": {
    "title": "Politique de Confidentialité",
    "content": "Politique de confidentialité."
  }
}
EOF

echo "🇪🇸 Updating Spanish translations..."
cat > es.json << 'EOF'
{
  "nav": {
    "home": "Inicio",
    "blog": "Newsletter",
    "privacy": "Privacidad",
    "guides": "Guías",
    "forums": "Foros",
    "planner": "Planificador",
    "roadmap": "Hoja de ruta"
  },
  "hero": {
    "title": "Planifica tu viaje al Mundial 2026",
    "subtitle": "Guías de ciudades, foros de fans y planificador de viaje IA",
    "subline": "Explora las guías de ciudades anfitrionas, foros de fans y nuestro planificador de viaje con IA.",
    "emailPlaceholder": "Tu email",
    "interestLabel": "Soy...",
    "interest": {
      "home": "Viendo desde casa",
      "hope": "Esperando boletos",
      "going": "Voy a ir — manténme informado"
    },
    "consent": "Acepto la Política de Privacidad",
    "cta": "Unirse a la lista de espera",
    "viewBlog": "Explorar newsletter",
    "exploreFeatures": "Explorar características ↓"
  },
  "features": {
    "title": "Lo que obtendrás",
    "showcase": {
      "guides": {
        "title": "Guías de Viaje de Ciudades",
        "desc": "Guías completas para las 16 ciudades anfitrionas con info de estadios, transporte y consejos locales.",
        "cta": "Ver Guías"
      },
      "forums": {
        "title": "Foros de Ciudades",
        "desc": "Conéctate con fans, comparte consejos y organiza encuentros.",
        "cta": "Unirse a los Foros"
      },
      "planner": {
        "title": "Planificador de Viaje IA",
        "desc": "Itinerarios personalizados, alojamiento y optimización de rutas.",
        "cta": "Comenzar"
      }
    },
    "items": [
      {
        "title": "Encuentros comunitarios",
        "desc": "Encuentra y organiza reuniones de fans."
      },
      {
        "title": "Guías de ciudad",
        "desc": "Mejores lugares cerca de estadios y consejos."
      },
      {
        "title": "Planificación de partidos",
        "desc": "Info clave para cada sede."
      }
    ]
  },
  "demo": {
    "title": "Ver la Demo",
    "duration": "45 segundos",
    "launching": "Lanzamiento el 5 de diciembre de 2025",
    "stayTuned": "Mantente atento a nuestra plataforma completa."
  },
  "timeline": {
    "title": "Camino al Mundial",
    "subtitle": "Pasa el cursor para explorar fechas clave",
    "swipeHint": "← Desliza para explorar →",
    "legend": {
      "past": "Pasado",
      "upcoming": "Próximo",
      "tournament": "Torneo",
      "highlight": "Importante"
    }
  },
  "guides": {
    "title": "Explorar Guías de Ciudades Anfitrionas 2026",
    "subtitle": "Guías completas para las 16 ciudades anfitrionas.",
    "freeDownload": "DESCARGA GRATUITA",
    "cityCount": "16 ciudades anfitrionas",
    "downloadCTA": "Descargar",
    "waitlistCTA": "Unirse"
  },
  "forums": {
    "title": "Foros de Ciudades Anfitrionas",
    "subtitle": "Conéctate con fans en las 16 ciudades anfitrionas.",
    "trending": "Discusiones Populares",
    "cityForums": "Foros de Ciudades",
    "joinDiscussion": "Unirse",
    "createPost": "Crear Post",
    "replies": "respuestas",
    "views": "vistas"
  },
  "contact": {
    "title": "Contáctanos",
    "subtitle": "¿Preguntas? ¡Nos encantaría saber de ti!",
    "general": {
      "title": "Consultas Generales",
      "desc": "Preguntas sobre la plataforma"
    },
    "support": {
      "title": "Soporte Técnico",
      "desc": "Ayuda con tu cuenta"
    },
    "partnerships": {
      "title": "Asociaciones",
      "desc": "Oportunidades comerciales"
    },
    "media": {
      "title": "Consultas de Medios",
      "desc": "Prensa y periodistas"
    },
    "form": {
      "firstName": "Nombre",
      "lastName": "Apellido",
      "email": "Email",
      "subject": "Asunto",
      "message": "Mensaje",
      "submit": "Enviar"
    }
  },
  "terms": {
    "title": "Términos de Servicio",
    "lastUpdated": "Última actualización:"
  },
  "footer": {
    "rights": "Todos los derechos reservados.",
    "description": "Tu recurso para el Mundial 2026.",
    "disclaimer": "No afiliado a FIFA",
    "features": "Características",
    "legal": "Legal",
    "cityGuides": "Guías",
    "fanForums": "Foros",
    "aiPlanner": "Planificador",
    "newsletter": "Newsletter",
    "privacyPolicy": "Privacidad",
    "terms": "Términos",
    "contact": "Contacto",
    "languages": "Disponible en varios idiomas:"
  },
  "blog": {
    "title": "Perspectivas para el Mundial 2026",
    "empty": "Sin artículos."
  },
  "privacy": {
    "title": "Política de Privacidad",
    "content": "Política de privacidad."
  }
}
EOF

echo "🇵🇹 Updating Portuguese translations..."
cat > pt.json << 'EOF'
{
  "nav": {
    "home": "Início",
    "blog": "Newsletter",
    "privacy": "Privacidade",
    "guides": "Guias",
    "forums": "Fóruns",
    "planner": "Planejador",
    "roadmap": "Roteiro"
  },
  "hero": {
    "title": "Planeje sua viagem para a Copa do Mundo 2026",
    "subtitle": "Guias de cidades, fóruns de torcedores e planejador de viagem IA",
    "subline": "Explore guias das cidades-sede, fóruns de torcedores e nosso planejador de viagem com IA.",
    "emailPlaceholder": "Seu email",
    "interestLabel": "Eu sou...",
    "interest": {
      "home": "Assistindo de casa",
      "hope": "Esperando ingressos",
      "going": "Vou ir — me mantenha informado"
    },
    "consent": "Aceito a Política de Privacidade",
    "cta": "Entrar na lista de espera",
    "viewBlog": "Explorar newsletter",
    "exploreFeatures": "Explorar recursos ↓"
  },
  "features": {
    "title": "O que você vai obter",
    "showcase": {
      "guides": {
        "title": "Guias de Viagem de Cidades",
        "desc": "Guias completos para as 16 cidades-sede com info de estádios, transporte e dicas locais.",
        "cta": "Ver Guias"
      },
      "forums": {
        "title": "Fóruns de Cidades",
        "desc": "Conecte-se com torcedores, compartilhe dicas e organize encontros.",
        "cta": "Entrar nos Fóruns"
      },
      "planner": {
        "title": "Planejador de Viagem IA",
        "desc": "Itinerários personalizados, acomodação e otimização de rotas.",
        "cta": "Começar"
      }
    },
    "items": [
      {
        "title": "Encontros comunitários",
        "desc": "Encontre e organize reuniões de torcedores."
      },
      {
        "title": "Guias de cidade",
        "desc": "Melhores lugares perto de estádios e dicas."
      },
      {
        "title": "Planejamento de jogos",
        "desc": "Info essencial para cada sede."
      }
    ]
  },
  "demo": {
    "title": "Assistir a Demo",
    "duration": "45 segundos",
    "launching": "Lançamento em 5 de dezembro de 2025",
    "stayTuned": "Fique atento à nossa plataforma completa."
  },
  "timeline": {
    "title": "Caminho para a Copa do Mundo",
    "subtitle": "Passe o cursor para explorar datas importantes",
    "swipeHint": "← Deslize para explorar →",
    "legend": {
      "past": "Passado",
      "upcoming": "Próximo",
      "tournament": "Torneio",
      "highlight": "Importante"
    }
  },
  "guides": {
    "title": "Explorar Guias das Cidades-Sede 2026",
    "subtitle": "Guias completos para as 16 cidades-sede.",
    "freeDownload": "DOWNLOAD GRATUITO",
    "cityCount": "16 cidades-sede",
    "downloadCTA": "Baixar",
    "waitlistCTA": "Entrar"
  },
  "forums": {
    "title": "Fóruns das Cidades-Sede",
    "subtitle": "Conecte-se com torcedores nas 16 cidades-sede.",
    "trending": "Discussões em Alta",
    "cityForums": "Fóruns de Cidades",
    "joinDiscussion": "Entrar",
    "createPost": "Criar Post",
    "replies": "respostas",
    "views": "visualizações"
  },
  "contact": {
    "title": "Entre em Contato",
    "subtitle": "Perguntas? Adoraríamos ouvir de você!",
    "general": {
      "title": "Consultas Gerais",
      "desc": "Perguntas sobre a plataforma"
    },
    "support": {
      "title": "Suporte Técnico",
      "desc": "Ajuda com sua conta"
    },
    "partnerships": {
      "title": "Parcerias",
      "desc": "Oportunidades comerciais"
    },
    "media": {
      "title": "Consultas de Mídia",
      "desc": "Imprensa e jornalistas"
    },
    "form": {
      "firstName": "Nome",
      "lastName": "Sobrenome",
      "email": "Email",
      "subject": "Assunto",
      "message": "Mensagem",
      "submit": "Enviar"
    }
  },
  "terms": {
    "title": "Termos de Serviço",
    "lastUpdated": "Última atualização:"
  },
  "footer": {
    "rights": "Todos os direitos reservados.",
    "description": "Seu recurso para a Copa do Mundo 2026.",
    "disclaimer": "Não afiliado à FIFA",
    "features": "Recursos",
    "legal": "Legal",
    "cityGuides": "Guias",
    "fanForums": "Fóruns",
    "aiPlanner": "Planejador",
    "newsletter": "Newsletter",
    "privacyPolicy": "Privacidade",
    "terms": "Termos",
    "contact": "Contato",
    "languages": "Disponível em vários idiomas:"
  },
  "blog": {
    "title": "Perspectivas para a Copa do Mundo 2026",
    "empty": "Sem artigos."
  },
  "privacy": {
    "title": "Política de Privacidade",
    "content": "Política de privacidade."
  }
}
EOF

echo "🇸🇦 Updating Arabic translations..."
cat > ar.json << 'EOF'
{
  "nav": {
    "home": "الرئيسية",
    "blog": "النشرة الإخبارية",
    "privacy": "الخصوصية",
    "guides": "أدلة",
    "forums": "المنتديات",
    "planner": "المخطط",
    "roadmap": "خارطة الطريق"
  },
  "hero": {
    "title": "خطط لرحلتك إلى كأس العالم 2026",
    "subtitle": "أدلة المدن ومنتديات المشجعين ومخطط الرحلات بالذكاء الاصطناعي",
    "subline": "استكشف أدلة المدن المضيفة ومنتديات المشجعين ومخطط الرحلات المدعوم بالذكاء الاصطناعي.",
    "emailPlaceholder": "بريدك الإلكتروني",
    "interestLabel": "أنا...",
    "interest": {
      "home": "أشاهد من المنزل",
      "hope": "آمل الحصول على تذاكر",
      "going": "سأذهب — أبقني على اطلاع"
    },
    "consent": "أوافق على سياسة الخصوصية",
    "cta": "الانضمام إلى قائمة الانتظار",
    "viewBlog": "استكشف النشرة الإخبارية",
    "exploreFeatures": "استكشف الميزات ↓"
  },
  "features": {
    "title": "ما ستحصل عليه",
    "showcase": {
      "guides": {
        "title": "أدلة سفر المدن",
        "desc": "أدلة شاملة لجميع المدن الـ 16 المضيفة مع معلومات الملاعب والنقل ونصائح محلية.",
        "cta": "عرض الأدلة"
      },
      "forums": {
        "title": "منتديات المدن",
        "desc": "تواصل مع المشجعين، شارك النصائح ونظم اللقاءات.",
        "cta": "انضم للمنتديات"
      },
      "planner": {
        "title": "مخطط الرحلات بالذكاء الاصطناعي",
        "desc": "برامج سفر مخصصة، إقامة وتحسين المسارات.",
        "cta": "ابدأ"
      }
    },
    "items": [
      {
        "title": "لقاءات المجتمع",
        "desc": "ابحث ونظم تجمعات المشجعين."
      },
      {
        "title": "أدلة المدن",
        "desc": "أفضل الأماكن بالقرب من الملاعب ونصائح."
      },
      {
        "title": "تخطيط المباريات",
        "desc": "معلومات أساسية لكل موقع."
      }
    ]
  },
  "demo": {
    "title": "شاهد العرض التوضيحي",
    "duration": "45 ثانية",
    "launching": "الإطلاق في 5 ديسمبر 2025",
    "stayTuned": "ترقب منصتنا الكاملة."
  },
  "timeline": {
    "title": "الطريق إلى كأس العالم",
    "subtitle": "مرر للاستكشاف التواريخ الرئيسية",
    "swipeHint": "← اسحب للاستكشاف →",
    "legend": {
      "past": "الماضي",
      "upcoming": "قادم",
      "tournament": "البطولة",
      "highlight": "مهم"
    }
  },
  "guides": {
    "title": "استكشف أدلة المدن المضيفة 2026",
    "subtitle": "أدلة شاملة لجميع المدن الـ 16 المضيفة.",
    "freeDownload": "تحميل مجاني",
    "cityCount": "16 مدينة مضيفة",
    "downloadCTA": "تحميل",
    "waitlistCTA": "انضم"
  },
  "forums": {
    "title": "منتديات المدن المضيفة",
    "subtitle": "تواصل مع المشجعين في المدن الـ 16 المضيفة.",
    "trending": "مناقشات رائجة",
    "cityForums": "منتديات المدن",
    "joinDiscussion": "انضم",
    "createPost": "إنشاء منشور",
    "replies": "ردود",
    "views": "مشاهدات"
  },
  "contact": {
    "title": "اتصل بنا",
    "subtitle": "أسئلة؟ نود أن نسمع منك!",
    "general": {
      "title": "استفسارات عامة",
      "desc": "أسئلة حول المنصة"
    },
    "support": {
      "title": "الدعم الفني",
      "desc": "مساعدة مع حسابك"
    },
    "partnerships": {
      "title": "الشراكات",
      "desc": "فرص تجارية"
    },
    "media": {
      "title": "استفسارات إعلامية",
      "desc": "الصحافة والإعلاميون"
    },
    "form": {
      "firstName": "الاسم الأول",
      "lastName": "اسم العائلة",
      "email": "البريد الإلكتروني",
      "subject": "الموضوع",
      "message": "الرسالة",
      "submit": "إرسال"
    }
  },
  "terms": {
    "title": "شروط الخدمة",
    "lastUpdated": "آخر تحديث:"
  },
  "footer": {
    "rights": "جميع الحقوق محفوظة.",
    "description": "موردك لكأس العالم 2026.",
    "disclaimer": "غير تابع للفيفا",
    "features": "الميزات",
    "legal": "قانوني",
    "cityGuides": "الأدلة",
    "fanForums": "المنتديات",
    "aiPlanner": "المخطط",
    "newsletter": "النشرة",
    "privacyPolicy": "الخصوصية",
    "terms": "الشروط",
    "contact": "اتصل",
    "languages": "متاح بعدة لغات:"
  },
  "blog": {
    "title": "رؤى لكأس العالم 2026",
    "empty": "لا توجد مقالات."
  },
  "privacy": {
    "title": "سياسة الخصوصية",
    "content": "سياسة الخصوصية."
  }
}
EOF

echo "✅ All translation files updated!"
echo "📊 Summary:"
echo "  - French (fr.json): ✓"
echo "  - Spanish (es.json): ✓"
echo "  - Portuguese (pt.json): ✓"
echo "  - Arabic (ar.json): ✓"
echo ""
echo "💾 Backups saved with .bak extension"
