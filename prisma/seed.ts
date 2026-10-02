import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Кадровые" },
      update: {},
      create: { name: "Кадровые", icon: "Users", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { name: "Бухгалтерские" },
      update: {},
      create: { name: "Бухгалтерские", icon: "Calculator", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { name: "Юридические" },
      update: {},
      create: { name: "Юридические", icon: "Scale", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { name: "Воинские" },
      update: {},
      create: { name: "Воинские", icon: "Shield", sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { name: "Учебные" },
      update: {},
      create: { name: "Учебные", icon: "GraduationCap", sortOrder: 5 },
    }),
  ]);

  const [kadrovye, buh, yurid, voinskie, uchebnye] = categories;

  // Templates
  const templates = [
    {
      name: "Заявление на отпуск",
      categoryId: kadrovye.id,
      description: "с автозаполнением",
      isActive: true,
      isPremium: false,
      sortOrder: 1,
      fields: [
        {
          id: "company_name",
          label: "Название организации",
          type: "text",
          placeholder: "ООО «Ромашка»",
          required: true,
        },
        {
          id: "director_name",
          label: "ФИО директора (Дательный падеж)",
          type: "text",
          placeholder: "Иванову И. И.",
          required: true,
        },
        {
          id: "applicant_name",
          label: "ФИО заявителя (Родительный падеж)",
          type: "text",
          placeholder: "Петрова Петра Петровича",
          required: true,
        },
        {
          id: "position",
          label: "Должность",
          type: "text",
          placeholder: "менеджера отдела продаж",
          required: true,
        },
        {
          id: "start_date",
          label: "Дата начала",
          type: "date",
          required: true,
        },
        {
          id: "days_count",
          label: "Количество дней",
          type: "number",
          placeholder: "14",
          required: true,
        },
        {
          id: "end_date",
          label: "Дата окончания (рассчитывается)",
          type: "date",
          computed: "start_date + days_count",
          required: false,
        },
        {
          id: "sign_date",
          label: "Дата подписания",
          type: "date",
          required: true,
        },
        {
          id: "applicant_short_name",
          label: "ФИО заявителя (Инициалы)",
          type: "text",
          placeholder: "Петров П. П.",
          required: true,
        },
      ],
      content: `<div class="document-page">
  <div style="text-align: right; margin-bottom: 40px;">
    <p style="margin: 4px 0;">Директору {{company_name}}</p>
    <p style="margin: 4px 0;">{{director_name}}</p>
    <p style="margin: 4px 0;">от <span class="doc-field">{{position}}</span></p>
    <p style="margin: 4px 0;"><span class="doc-field">{{applicant_name}}</span></p>
  </div>

  <h1 style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 40px 0;">ЗАЯВЛЕНИЕ</h1>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8;">
    Прошу предоставить мне ежегодный оплачиваемый отпуск с <span class="doc-field">{{start_date}}</span> по <span class="doc-field">{{end_date}}</span> (<span class="doc-field">{{days_count}}</span> календарных дней).
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 80px;">
    <p>«{{sign_day}}» {{sign_month}} {{sign_year}} г.</p>
    <div style="text-align: center;">
      <p>_______________________</p>
      <p style="margin-top: 4px;">{{applicant_short_name}}</p>
    </div>
  </div>
</div>`,
    },
    {
      name: "Приказ о приёме на работу",
      categoryId: kadrovye.id,
      description: "форма Т-1",
      isActive: true,
      isPremium: false,
      sortOrder: 2,
      fields: [
        {
          id: "company_name",
          label: "Название организации",
          type: "text",
          placeholder: "ООО «Ромашка»",
          required: true,
        },
        {
          id: "order_number",
          label: "Номер приказа",
          type: "text",
          placeholder: "001",
          required: true,
        },
        {
          id: "order_date",
          label: "Дата приказа",
          type: "date",
          required: true,
        },
        {
          id: "employee_name",
          label: "ФИО сотрудника",
          type: "text",
          placeholder: "Иванов Иван Иванович",
          required: true,
        },
        {
          id: "department",
          label: "Подразделение",
          type: "text",
          placeholder: "Отдел продаж",
          required: true,
        },
        {
          id: "position",
          label: "Должность",
          type: "text",
          placeholder: "Менеджер",
          required: true,
        },
        {
          id: "salary",
          label: "Оклад (руб.)",
          type: "text",
          placeholder: "50 000",
          required: true,
        },
        {
          id: "start_date",
          label: "Дата приёма на работу",
          type: "date",
          required: true,
        },
        {
          id: "director_name",
          label: "ФИО руководителя",
          type: "text",
          placeholder: "Петров П. П.",
          required: true,
        },
        {
          id: "director_position",
          label: "Должность руководителя",
          type: "text",
          placeholder: "Директор",
          required: true,
        },
      ],
      content: `<div class="document-page">
  <div style="text-align: center; margin-bottom: 20px;">
    <p style="font-weight: bold; font-size: 16px;">{{company_name}}</p>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div>
      <p>ПРИКАЗ № <span class="doc-field">{{order_number}}</span></p>
      <p>о приёме работника на работу</p>
    </div>
    <div>
      <p>Дата: <span class="doc-field">{{order_date}}</span></p>
    </div>
  </div>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8; margin-bottom: 20px;">
    Принять на работу с <span class="doc-field">{{start_date}}</span>:
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <tr>
      <td style="width: 40%; padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">ФИО</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><span class="doc-field">{{employee_name}}</span></td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Подразделение</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><span class="doc-field">{{department}}</span></td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Должность</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><span class="doc-field">{{position}}</span></td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Оклад</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><span class="doc-field">{{salary}}</span> руб.</td>
    </tr>
  </table>

  <div style="display: flex; justify-content: space-between; margin-top: 40px;">
    <div>
      <p>{{director_position}}</p>
    </div>
    <div style="text-align: center;">
      <p>_______________________</p>
      <p>{{director_name}}</p>
    </div>
  </div>

  <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
    <p>С приказом ознакомлен(а): _______________________  {{employee_name}}</p>
    <p style="margin-top: 8px;">Дата: _______________________</p>
  </div>
</div>`,
    },
    {
      name: "Рапорт о предоставлении отпуска",
      categoryId: voinskie.id,
      description: "с расчётом дат",
      isActive: true,
      isPremium: false,
      sortOrder: 1,
      fields: [
        {
          id: "commander_rank",
          label: "Звание командира",
          type: "text",
          placeholder: "полковнику",
          required: true,
        },
        {
          id: "commander_name",
          label: "ФИО командира",
          type: "text",
          placeholder: "Иванову И. И.",
          required: true,
        },
        {
          id: "unit_name",
          label: "Наименование части",
          type: "text",
          placeholder: "в/ч 00000",
          required: true,
        },
        {
          id: "applicant_rank",
          label: "Звание заявителя",
          type: "text",
          placeholder: "лейтенанта",
          required: true,
        },
        {
          id: "applicant_name",
          label: "ФИО заявителя",
          type: "text",
          placeholder: "Петрова П. П.",
          required: true,
        },
        {
          id: "leave_type",
          label: "Вид отпуска",
          type: "text",
          placeholder: "основной",
          required: true,
        },
        {
          id: "days_count",
          label: "Количество дней",
          type: "number",
          placeholder: "30",
          required: true,
        },
        {
          id: "start_date",
          label: "Дата начала",
          type: "date",
          required: true,
        },
        {
          id: "end_date",
          label: "Дата окончания",
          type: "date",
          computed: "start_date + days_count",
          required: false,
        },
        {
          id: "destination",
          label: "Место проведения отпуска",
          type: "text",
          placeholder: "г. Москва",
          required: true,
        },
      ],
      content: `<div class="document-page">
  <div style="text-align: right; margin-bottom: 40px;">
    <p>Командиру <span class="doc-field">{{unit_name}}</span></p>
    <p><span class="doc-field">{{commander_rank}}</span></p>
    <p><span class="doc-field">{{commander_name}}</span></p>
    <p style="margin-top: 10px;">от <span class="doc-field">{{applicant_rank}}</span></p>
    <p><span class="doc-field">{{applicant_name}}</span></p>
  </div>

  <h1 style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 40px 0;">РАПОРТ</h1>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8;">
    Прошу предоставить мне <span class="doc-field">{{leave_type}}</span> отпуск продолжительностью <span class="doc-field">{{days_count}}</span> суток с <span class="doc-field">{{start_date}}</span> по <span class="doc-field">{{end_date}}</span>.
  </p>

  <p style="text-indent: 40px; line-height: 1.8; margin-top: 15px;">
    Место проведения отпуска: <span class="doc-field">{{destination}}</span>.
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 60px;">
    <p>«___» __________ 20__ г.</p>
    <div style="text-align: center;">
      <p>_______________________</p>
      <p style="margin-top: 4px;">{{applicant_name}}</p>
    </div>
  </div>
</div>`,
    },
    {
      name: "Служебная записка",
      categoryId: kadrovye.id,
      description: "внутренняя · пустой шаблон",
      isActive: true,
      isPremium: false,
      sortOrder: 3,
      fields: [
        {
          id: "recipient_name",
          label: "Кому",
          type: "text",
          placeholder: "Иванову И. И.",
          required: true,
        },
        {
          id: "recipient_position",
          label: "Должность получателя",
          type: "text",
          placeholder: "Директору",
          required: true,
        },
        {
          id: "sender_name",
          label: "От кого",
          type: "text",
          placeholder: "Петрова П. П.",
          required: true,
        },
        {
          id: "sender_position",
          label: "Должность отправителя",
          type: "text",
          placeholder: "Менеджер отдела продаж",
          required: true,
        },
        {
          id: "subject",
          label: "Тема",
          type: "text",
          placeholder: "О предоставлении информации",
          required: true,
        },
        {
          id: "doc_date",
          label: "Дата",
          type: "date",
          required: true,
        },
        {
          id: "content_text",
          label: "Содержание",
          type: "textarea",
          placeholder: "Прошу вас предоставить...",
          required: true,
        },
      ],
      content: `<div class="document-page">
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div>
      <p><strong>Кому:</strong> <span class="doc-field">{{recipient_position}}</span></p>
      <p><span class="doc-field">{{recipient_name}}</span></p>
    </div>
    <div>
      <p><strong>От:</strong> <span class="doc-field">{{sender_position}}</span></p>
      <p><span class="doc-field">{{sender_name}}</span></p>
      <p><strong>Дата:</strong> <span class="doc-field">{{doc_date}}</span></p>
    </div>
  </div>

  <h1 style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 30px 0;">СЛУЖЕБНАЯ ЗАПИСКА</h1>

  <p style="text-align: center; margin-bottom: 30px;"><strong>Тема:</strong> <span class="doc-field">{{subject}}</span></p>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8;">
    <span class="doc-field">{{content_text}}</span>
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 60px;">
    <div></div>
    <div style="text-align: center;">
      <p>_______________________</p>
      <p style="margin-top: 4px;">{{sender_name}}</p>
    </div>
  </div>
</div>`,
    },
    {
      name: "Претензия контрагенту",
      categoryId: yurid.id,
      description: "Юридические · готовый текст",
      isActive: true,
      isPremium: false,
      sortOrder: 1,
      fields: [
        {
          id: "company_from",
          label: "Ваша организация",
          type: "text",
          placeholder: "ООО «Ромашка»",
          required: true,
        },
        {
          id: "address_from",
          label: "Ваш адрес",
          type: "text",
          placeholder: "г. Москва, ул. Ленина, д. 1",
          required: true,
        },
        {
          id: "company_to",
          label: "Организация-ответчик",
          type: "text",
          placeholder: "ООО «Василёк»",
          required: true,
        },
        {
          id: "address_to",
          label: "Адрес ответчика",
          type: "text",
          placeholder: "г. Москва, ул. Пушкина, д. 5",
          required: true,
        },
        {
          id: "contract_number",
          label: "Номер договора",
          type: "text",
          placeholder: "123",
          required: true,
        },
        {
          id: "contract_date",
          label: "Дата договора",
          type: "date",
          required: true,
        },
        {
          id: "claim_amount",
          label: "Сумма претензии (руб.)",
          type: "text",
          placeholder: "100 000",
          required: true,
        },
        {
          id: "claim_reason",
          label: "Основание претензии",
          type: "textarea",
          placeholder: "Описание нарушения",
          required: true,
        },
        {
          id: "response_days",
          label: "Срок ответа (дней)",
          type: "number",
          placeholder: "30",
          required: true,
        },
        {
          id: "doc_date",
          label: "Дата претензии",
          type: "date",
          required: true,
        },
      ],
      content: `<div class="document-page">
  <div style="margin-bottom: 30px;">
    <p><strong>От:</strong> <span class="doc-field">{{company_from}}</span></p>
    <p><span class="doc-field">{{address_from}}</span></p>
    <p style="margin-top: 10px;"><strong>Кому:</strong> <span class="doc-field">{{company_to}}</span></p>
    <p><span class="doc-field">{{address_to}}</span></p>
  </div>

  <h1 style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 30px 0;">ПРЕТЕНЗИЯ</h1>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8; margin-bottom: 15px;">
    В соответствии с договором № <span class="doc-field">{{contract_number}}</span> от <span class="doc-field">{{contract_date}}</span> между <span class="doc-field">{{company_from}}</span> и <span class="doc-field">{{company_to}}</span>, заявляем претензию в отношении следующего нарушения:
  </p>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8; margin-bottom: 15px;">
    <span class="doc-field">{{claim_reason}}</span>
  </p>

  <p style="text-indent: 40px; line-height: 1.8; margin-bottom: 15px;">
    В связи с вышеизложенным требуем в течение <span class="doc-field">{{response_days}}</span> календарных дней с момента получения настоящей претензии устранить нарушение и/или выплатить сумму в размере <strong><span class="doc-field">{{claim_amount}}</span> рублей</strong>.
  </p>

  <p style="text-indent: 40px; line-height: 1.8;">
    В случае неудовлетворения настоящей претензии в указанный срок оставляем за собой право обратиться в суд с соответствующим исковым заявлением.
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 60px;">
    <p><span class="doc-field">{{doc_date}}</span></p>
    <div style="text-align: right;">
      <p>_______________________</p>
      <p>Руководитель <span class="doc-field">{{company_from}}</span></p>
    </div>
  </div>
</div>`,
    },
    {
      name: "Объяснительная записка",
      categoryId: kadrovye.id,
      description: "Кадровые · пустой шаблон",
      isActive: true,
      isPremium: false,
      sortOrder: 4,
      fields: [
        {
          id: "company_name",
          label: "Организация",
          type: "text",
          placeholder: "ООО «Ромашка»",
          required: true,
        },
        {
          id: "director_name",
          label: "ФИО руководителя (Дательный)",
          type: "text",
          placeholder: "Иванову И. И.",
          required: true,
        },
        {
          id: "director_position",
          label: "Должность руководителя",
          type: "text",
          placeholder: "Директору",
          required: true,
        },
        {
          id: "applicant_name",
          label: "ФИО (Родительный)",
          type: "text",
          placeholder: "Петрова Петра Петровича",
          required: true,
        },
        {
          id: "position",
          label: "Должность",
          type: "text",
          placeholder: "менеджера",
          required: true,
        },
        {
          id: "incident_date",
          label: "Дата нарушения",
          type: "date",
          required: true,
        },
        {
          id: "explanation",
          label: "Объяснение",
          type: "textarea",
          placeholder: "Прошу принять во внимание...",
          required: true,
        },
        {
          id: "doc_date",
          label: "Дата записки",
          type: "date",
          required: true,
        },
        {
          id: "applicant_short",
          label: "ФИО (инициалы)",
          type: "text",
          placeholder: "Петров П. П.",
          required: true,
        },
      ],
      content: `<div class="document-page">
  <div style="text-align: right; margin-bottom: 40px;">
    <p><span class="doc-field">{{director_position}}</span> <span class="doc-field">{{company_name}}</span></p>
    <p><span class="doc-field">{{director_name}}</span></p>
    <p style="margin-top: 10px;">от <span class="doc-field">{{position}}</span></p>
    <p><span class="doc-field">{{applicant_name}}</span></p>
  </div>

  <h1 style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 40px 0;">ОБЪЯСНИТЕЛЬНАЯ ЗАПИСКА</h1>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8; margin-bottom: 15px;">
    <span class="doc-field">{{incident_date}}</span> я не смог(ла) выполнить свои должностные обязанности по следующей причине:
  </p>

  <p style="text-indent: 40px; text-align: justify; line-height: 1.8;">
    <span class="doc-field">{{explanation}}</span>
  </p>

  <div style="display: flex; justify-content: space-between; margin-top: 60px;">
    <p><span class="doc-field">{{doc_date}}</span></p>
    <div style="text-align: center;">
      <p>_______________________</p>
      <p style="margin-top: 4px;"><span class="doc-field">{{applicant_short}}</span></p>
    </div>
  </div>
</div>`,
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: {
        id: (
          await prisma.template.findFirst({
            where: {
              name: template.name,
              categoryId: template.categoryId,
            },
          })
        )?.id ?? "non-existent-id",
      },
      update: {
        content: template.content,
        fields: template.fields,
        description: template.description,
      },
      create: template,
    });
    console.log(`✅ Template: ${template.name}`);
  }

  // Admin user (if ADMIN_EMAIL is set)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const hashedPassword = await bcrypt.hash("Admin123!@#", 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isAdmin: true },
      create: {
        email: adminEmail,
        name: "Администратор",
        isAdmin: true,
        password: hashedPassword,
      },
    });
    console.log(`✅ Admin user: ${adminEmail}`);
    console.log("");
    console.log("════════════════════════════════════════════════════");
    console.log("  ДАННЫЕ АДМИНИСТРАТОРА (сохраните их!)");
    console.log("════════════════════════════════════════════════════");
    console.log(`  URL:      /admin`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Пароль:   Admin123!@#`);
    console.log("  ⚠️  Смените пароль после первого входа!");
    console.log("════════════════════════════════════════════════════");
    console.log("");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
