import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ButtonRouterLink } from "../../components/Button";
import {
  BookIcon,
  ClockIcon,
  PencilIcon,
  ChevronRightIcon,
  CodeIcon,
  GraduationCapIcon,
  PlayIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TelegramIcon,
  UsersIcon,
  ChevronDownIcon,
  AwardIcon,
} from "../../components/icons";
import { CourseCard } from "../courses/CourseCard";
import { getCourses } from "../../services/api/courses";
import type { CourseListItem } from "../../types/api";
import { ROUTES } from "../../router/paths";
import { HOME_COPY, type HomeFeatureId } from "./copy";
import styles from "./Home.module.css";

const FEATURE_ICONS: Record<HomeFeatureId, ReactNode> = {
  structured: <BookIcon size={20} />,
  pace: <ClockIcon size={20} />,
  practice: <PencilIcon size={20} />,
  telegram: <TelegramIcon size={20} />,
};

const TECH_STACK = [
  { name: "Python", category: "Backend" },
  { name: "Django", category: "Framework" },
  { name: "REST API", category: "Architecture" },
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Kotlin", category: "Mobile" },
  { name: "Android", category: "Mobile" },
  { name: "Docker", category: "DevOps" },
  { name: "Git", category: "Tools" },
];

const TRACKS = [
  {
    slug: "backend",
    title: "Backend dasturchi",
    icon: "🐍",
    coursesCount: "3 ta kurs",
    duration: "4-6 oy",
    level: "Boshlang'ichdan — Yuqorigacha",
    desc: "Python sintaksisidan boshlab Django frameworki, ma'lumotlar bazasi va xavfsiz REST API arxitekturasini o'rganing.",
    skills: ["Python", "Django", "DRF", "PostgreSQL"],
  },
  {
    slug: "frontend",
    title: "Frontend dasturchi",
    icon: "⚛️",
    coursesCount: "3 ta kurs",
    duration: "4-5 oy",
    level: "Boshlang'ichdan — Yuqorigacha",
    desc: "Semantik HTML/CSS, zamonaviy JavaScript ichki mexanizmlari va interaktiv React ilovalarini quring.",
    skills: ["HTML5 / CSS3", "JavaScript ES6+", "React", "TypeScript"],
  },
  {
    slug: "malumotlar-bazalari",
    title: "Ma'lumotlar bazasi",
    icon: "🗄️",
    coursesCount: "2 ta kurs",
    duration: "2-3 oy",
    level: "O'rta va Yuqori",
    desc: "SQL so'rovlarini noldan boshlab murakkab joinlar, indekslash va PostgreSQL optimizatsiyasini o'rganing.",
    skills: ["SQL", "PostgreSQL", "Query Tuning", "Database Design"],
  },
  {
    slug: "mobil-dasturlash",
    title: "Android dasturchi",
    icon: "📱",
    coursesCount: "2 ta kurs",
    duration: "4-6 oy",
    level: "Boshlang'ichdan — O'rtagacha",
    desc: "Kotlin tilining barcha imkoniyatlari, Jetpack Compose va zamonaviy arxitektura bilan Android ilovalar yozing.",
    skills: ["Kotlin", "Android SDK", "Jetpack Compose", "Coroutines"],
  },
];

const INSTRUCTORS = [
  {
    name: "Diyorbek Asatullayev",
    role: "Backend Lead & Dasturchi",
    bio: "Python va Django bo'yicha 6 yillik amaliy tajriba. Yuqori yuklamali xizmatlar va API tizimlarini quradi.",
    initials: "DA",
    course: "Python & Django yo'nalishi",
  },
  {
    name: "Malika Karimova",
    role: "Frontend Engineer & Mentor",
    bio: "React va zamonaviy foydalanuvchi interfeyslari (UI/UX) bo'yicha mutaxassis, o'nlab loyihalar muallifi.",
    initials: "MK",
    course: "Frontend & React yo'nalishi",
  },
  {
    name: "Jasur Toshmatov",
    role: "Database Engineer",
    bio: "PostgreSQL, relyatsion modellar va SQL so'rovlarini optimallashtirish bo'yicha ko'p yillik amaliyotchi.",
    initials: "JT",
    course: "Ma'lumotlar bazasi yo'nalishi",
  },
  {
    name: "Nodira Yusupova",
    role: "Mobile Developer",
    bio: "Flutter va Kotlin'da 15+ dan ortiq mobil ilovalarni Google Play'ga chiqargan amaliyotchi muhandis.",
    initials: "NY",
    course: "Android & Kotlin yo'nalishi",
  },
];

const TESTIMONIALS = [
  {
    name: "Bobur Mirzayev",
    role: "Junior Backend Developer",
    avatar: "BM",
    text: "Telegram orqali login tizimi judayam qulay! Hech qanday parollarni eslab qolish shart emas. Django kursi orqali birinchi haqiqiy API loyihamni mustaqil yakunladim.",
    course: "Django bilan veb-dasturlash",
    rating: 5,
  },
  {
    name: "Sevara Alimova",
    role: "Frontend Dasturchi",
    avatar: "SA",
    text: "JavaScript va HTML/CSS kurslari judayam tushunarli. Darslar ortiqcha suvdan xoli, faqat amaliyotga asoslangan. Tungi rejimda dars qilish ayniqsa yoqdi!",
    course: "JavaScript: chuqur o'rganish",
    rating: 5,
  },
  {
    name: "Javohir Ergashev",
    role: "Talaba / Dasturchi",
    avatar: "JE",
    text: "Platformaning soddaligi va tezligi qoyil qoldirdi. O'zbek tilida bu darajada sifatli va professional tayyorlangan kurslar kam. Barchaga tavsiya qilaman.",
    course: "Python asoslari",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "Platformada o'qishni boshlash uchun nima talab qilinadi?",
    a: "Hech qanday murakkab ro'yxatdan o'tish formasi yoki parol talab qilinmaydi. Shunchaki 'Telegram orqali kirish' tugmasini bosing va botimizda bir martalik tasdiqlashdan o'ting. Shundan so'ng barcha kurslar profilingizga ulanadi.",
  },
  {
    q: "Dasturlash bo'yicha bilimim umuman bo'lmasa ham o'rgana olamanmi?",
    a: "Ha, albatta! Bizning katalogimizda 'Boshlang'ich' darajadagi kurslar mavjud (masalan, Python asoslari, HTML/CSS asoslari). Ular kompyuter va dasturlash bilan endi tanishayotganlar uchun mutlaqo noldan boshlab tushuntirilgan.",
  },
  {
    q: "Darslar qaysi formatda bo'ladi va qachon ko'rishim mumkin?",
    a: "Platformamiz 24/7 onlayn rejimda ishlaydi. Siz o'zingizga qulay istalgan vaqtda — kunduzi ham, kechasi ham telefon yoki kompyuterdan darslarni o'z sur'atingizda o'rganishingiz mumkin.",
  },
  {
    q: "Kurslar davomida amaliy topshiriqlar bo'ladimi?",
    a: "Ha, platformamizning bosh falsafasi — 100% amaliyot! Har bir nazariy mavzu amaliy mashqlar va real hayotiy loyihalar bilan mustahkamlanadi.",
  },
  {
    q: "Savollarim paydo bo'lsa, qanday yordam olaman?",
    a: "Har bir o'quvchimiz Telegram boti va rasmiy hamjamiyatimiz orqali mentorlar hamda boshqa o'quvchilar bilan muloqot qilishi, savollariga tezkor javob olishi mumkin.",
  },
];

export function GuestLanding() {
  const [featuredCourses, setFeaturedCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCourses({ page: 1 })
      .then((data) => {
        if (active) {
          setFeaturedCourses(data.results.slice(0, 4));
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div data-testid="home-guest" className={styles.container}>
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className={styles.heroSection} aria-labelledby="home-hero-title">
        <div className={styles.heroBackdrop} aria-hidden="true" />

        <div className={styles.heroGrid}>
          {/* Left Column: Text & CTA */}
          <div className={styles.heroTextCol}>
            <div className={styles.heroBadge}>
              <span className={styles.badgePulse} />
              <SparklesIcon size={16} />
              <span>O'zbekistondagi zamonaviy IT ta'lim platformasi</span>
            </div>

            <h1 id="home-hero-title" className={styles.heroTitle}>
              Yangi bilimlarni o‘z sur’atingizda o‘rganing
            </h1>

            <p className={styles.heroLead}>
              Learn kurslar, darslar va amaliy topshiriqlarni bir joyga jamlaydi — o‘qishni boshlang va to‘xtagan joyingizdan davom eting.
            </p>

            <div className={styles.heroActions}>
              <ButtonRouterLink
                to={ROUTES.login}
                variant="primary"
                size="lg"
                className={styles.ctaPrimary}
                leadingIcon={<TelegramIcon size={20} />}
              >
                Telegram orqali kirish
              </ButtonRouterLink>

              <ButtonRouterLink
                to={ROUTES.courses}
                variant="secondary"
                size="lg"
                className={styles.ctaSecondary}
                trailingIcon={<ChevronRightIcon size={18} />}
              >
                Kurslarni tanlash
              </ButtonRouterLink>
            </div>

            {/* Social Proof */}
            <div className={styles.socialProof}>
              <div className={styles.avatarStack}>
                <span className={styles.proofAvatar} style={{ background: "#2563eb" }}>DA</span>
                <span className={styles.proofAvatar} style={{ background: "#0284c7" }}>MK</span>
                <span className={styles.proofAvatar} style={{ background: "#7c3aed" }}>JT</span>
                <span className={styles.proofAvatar} style={{ background: "#059669" }}>NY</span>
              </div>
              <div className={styles.proofText}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} size={15} className={styles.starIcon} />
                  ))}
                  <span className={styles.ratingNumber}>4.9/5.0</span>
                </div>
                <p className={styles.proofSub}>1,200+ o'quvchi biz bilan birga o'rganmoqda</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Course Showcase Mockup */}
          <div className={styles.heroVisualCol}>
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseCover}>
                <div className={styles.showcaseTag}>
                  <PlayIcon size={12} />
                  <span>Amaliy Dars</span>
                </div>
                <div className={styles.showcaseCodePreview}>
                  <code>{"def learn_coding():"}<br />{"    return 'Muvaffaqiyat'"}</code>
                </div>
              </div>

              <div className={styles.showcaseBody}>
                <div className={styles.showcaseHeader}>
                  <span className={styles.showcaseCat}>Backend yo'nalishi</span>
                  <span className={styles.showcaseLevel}>Boshlang'ich</span>
                </div>
                <h4 className={styles.showcaseTitle}>Python & Django Full Stack</h4>
                <p className={styles.showcaseDesc}>
                  Noldan boshlab API va veb-ilovalarni to'liq mustaqil qurishni o'rganing.
                </p>

                <div className={styles.progressSection}>
                  <div className={styles.progressLabelRow}>
                    <span>Darslar progressi</span>
                    <strong>12 / 24 dars (50%)</strong>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: "50%" }} />
                  </div>
                </div>

                <div className={styles.showcaseFooter}>
                  <div className={styles.showcaseInstructor}>
                    <span className={styles.instDot} />
                    <span>Diyorbek Asatullayev</span>
                  </div>
                  <span className={styles.showcaseStudents}>
                    <UsersIcon size={14} /> 240+ o'quvchi
                  </span>
                </div>
              </div>

              {/* Floating Glassmorphism Badges */}
              <div className={`${styles.floatingBadge} ${styles.badgeTopLeft}`}>
                <ShieldCheckIcon size={20} className={styles.badgeIconGreen} />
                <div>
                  <strong>100% Parolsiz</strong>
                  <span>Telegram bilan himoyalangan</span>
                </div>
              </div>

              <div className={`${styles.floatingBadge} ${styles.badgeBottomRight}`}>
                <AwardIcon size={20} className={styles.badgeIconBlue} />
                <div>
                  <strong>Amaliy Portfolio</strong>
                  <span>Haqiqiy loyihalar bilan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. TECH STACK STRIP ==================== */}
      <section className={styles.techStrip} aria-label="O'rgatiladigan texnologiyalar">
        <p className={styles.techStripTitle}>Eng talabgir texnologiyalar asosida o'qitamiz</p>
        <div className={styles.techPills}>
          {TECH_STACK.map((tech) => (
            <div key={tech.name} className={styles.techPill}>
              <CodeIcon size={14} className={styles.techIcon} />
              <span className={styles.techName}>{tech.name}</span>
              <span className={styles.techCat}>{tech.category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className={styles.features} aria-labelledby="home-features-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Platforma afzalliklari</span>
          <h2 id="home-features-title" className={styles.sectionTitle}>
            Learn nimaga yordam beradi
          </h2>
        </div>
        <ul className={styles.featureList}>
          {HOME_COPY.features.map((feature) => (
            <li key={feature.id} className={styles.feature}>
              <span className={styles.featureIcon}>{FEATURE_ICONS[feature.id]}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ==================== 3. FEATURED COURSES ==================== */}
      <section className={styles.section} aria-labelledby="featured-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Ommabop Kurslar</span>
          <h2 id="featured-title" className={styles.sectionTitle}>
            Talabalar eng ko'p tanlayotgan kurslar
          </h2>
          <p className={styles.sectionDesc}>
            Har bir kurs soha mutaxassislari tomonidan zamonaviy talablar asosida tayyorlangan.
          </p>
        </div>

        {loading ? (
          <div className={styles.coursesGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.courseSkeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}

        <div className={styles.coursesCtaRow}>
          <ButtonRouterLink
            to={ROUTES.courses}
            variant="secondary"
            size="lg"
            trailingIcon={<ChevronRightIcon size={18} />}
          >
            Barcha kurslar katalogini ko'rish (10+)
          </ButtonRouterLink>
        </div>
      </section>

      {/* ==================== 4. LEARNING PATHS (TRACKS) ==================== */}
      <section className={styles.section} aria-labelledby="tracks-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Kasbiy Yo'nalishlar</span>
          <h2 id="tracks-title" className={styles.sectionTitle}>
            Qaysi yo'nalish sizga ko'proq mos keladi?
          </h2>
          <p className={styles.sectionDesc}>
            Har bir dastur kasb egallash uchun kerakli barcha kurslarni bitta tartibli zanjirga jamlaydi.
          </p>
        </div>

        <div className={styles.tracksGrid}>
          {TRACKS.map((track) => (
            <Link
              key={track.slug}
              to={`${ROUTES.courses}?category=${track.slug}`}
              className={styles.trackCard}
            >
              <div className={styles.trackTop}>
                <span className={styles.trackEmoji}>{track.icon}</span>
                <span className={styles.trackCount}>{track.coursesCount}</span>
              </div>
              <h4 className={styles.trackTitle}>{track.title}</h4>
              <p className={styles.trackDesc}>{track.desc}</p>

              <div className={styles.trackMeta}>
                <span>⏱️ {track.duration}</span>
                <span>📊 {track.level}</span>
              </div>

              <div className={styles.trackSkills}>
                {track.skills.map((skill) => (
                  <span key={skill} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className={styles.trackLink}>
                <span>Dasturni ko'rish</span>
                <ChevronRightIcon size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== 5. HOW IT WORKS ==================== */}
      <section className={styles.howItWorks} aria-labelledby="how-it-works-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Oson va Qulay</span>
          <h2 id="how-it-works-title" className={styles.sectionTitle}>
            Learn'da o'qish qanday kechadi?
          </h2>
          <p className={styles.sectionDesc}>
            Murakkab byurokratiyalarsiz — 3 ta oddiy qadam bilan ta'limni boshlang.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h4 className={styles.stepTitle}>Telegram orqali kiring</h4>
            <p className={styles.stepText}>
              Parol o'ylab topish shart emas. Bitta havola yoki bot orqali 5 soniyada tizimga kiring.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h4 className={styles.stepTitle}>Kursni tanlang va o'rganing</h4>
            <p className={styles.stepText}>
              O'zingizga qulay yo'nalishni tanlab, 'Kursga yozilish' tugmasini bosing va darslarni boshlang.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h4 className={styles.stepTitle}>Amaliyotda qo'llang</h4>
            <p className={styles.stepText}>
              Har bir dars amaliy topshiriq bilan mustahkamlanadi. Kurs oxirida shaxsiy portfolioga ega bo'lasiz.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 6. INSTRUCTORS ==================== */}
      <section className={styles.section} aria-labelledby="instructors-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Bizning Ustozlar</span>
          <h2 id="instructors-title" className={styles.sectionTitle}>
            Soha mutaxassislaridan o'rganing
          </h2>
          <p className={styles.sectionDesc}>
            Faqat real kompaniyalarda ishlaydigan tajribali dasturchilar sizga ta'lim beradi.
          </p>
        </div>

        <div className={styles.instructorsGrid}>
          {INSTRUCTORS.map((inst) => (
            <div key={inst.name} className={styles.instructorCard}>
              <div className={styles.instAvatar}>{inst.initials}</div>
              <h4 className={styles.instName}>{inst.name}</h4>
              <p className={styles.instRole}>{inst.role}</p>
              <p className={styles.instBio}>{inst.bio}</p>
              <span className={styles.instCourseBadge}>{inst.course}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 7. TESTIMONIALS ==================== */}
      <section className={styles.section} aria-labelledby="testimonials-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>O'quvchilar Fikrlari</span>
          <h2 id="testimonials-title" className={styles.sectionTitle}>
            Talabalarimiz nima deyishadi?
          </h2>
          <p className={styles.sectionDesc}>
            Har kuni yuzlab dasturchilar platformamiz orqali o'z kasbiy mahoratini oshirmoqda.
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={styles.testimonialCard}>
              <div className={styles.tStars}>
                {[...Array(t.rating)].map((_, i) => (
                  <StarIcon key={i} size={16} className={styles.starIcon} />
                ))}
              </div>
              <p className={styles.tText}>"{t.text}"</p>
              <div className={styles.tAuthorRow}>
                <div className={styles.tAvatar}>{t.avatar}</div>
                <div className={styles.tInfo}>
                  <strong className={styles.tName}>{t.name}</strong>
                  <span className={styles.tRole}>{t.role}</span>
                  <span className={styles.tCourse}>O'rgangan: {t.course}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 8. FAQ ACCORDION ==================== */}
      <section className={styles.section} aria-labelledby="faq-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Savol-Javoblar</span>
          <h2 id="faq-title" className={styles.sectionTitle}>
            Tez-tez beriladigan savollar
          </h2>
          <p className={styles.sectionDesc}>
            Qiziqtirgan savollaringizga bu yerdan darhol javob topishingiz mumkin.
          </p>
        </div>

        <div className={styles.faqList}>
          {FAQS.map((faq, index) => (
            <details key={index} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                <span>{faq.q}</span>
                <ChevronDownIcon size={18} className={styles.faqIcon} />
              </summary>
              <div className={styles.faqAnswer}>
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ==================== 9. BOTTOM CTA BANNER ==================== */}
      <section className={styles.ctaBanner} aria-label="Ta'limni boshlash">
        <div className={styles.ctaContent}>
          <div className={styles.ctaBadge}>
            <GraduationCapIcon size={18} />
            <span>Keling, birga o'rganamiz</span>
          </div>
          <h2 className={styles.ctaTitle}>Dasturlash sari birinchi qadamni tashlang</h2>
          <p className={styles.ctaDesc}>
            Telegram orqali 1 daqiqada kiring, o'zingizga mos kursni tanlang va bugunoq amaliyotni boshlang.
          </p>
          <div className={styles.ctaBtnGroup}>
            <ButtonRouterLink
              to={ROUTES.login}
              variant="primary"
              size="lg"
              leadingIcon={<TelegramIcon size={20} />}
            >
              Telegram orqali boshlash
            </ButtonRouterLink>
            <ButtonRouterLink
              to={ROUTES.courses}
              variant="secondary"
              size="lg"
            >
              Barcha kurslar katalogi
            </ButtonRouterLink>
          </div>
        </div>
      </section>
    </div>
  );
}
