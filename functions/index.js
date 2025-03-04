const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Mailgun = require('mailgun-js');
const { PDFDocument } = require('pdf-lib');
const XLSX = require('xlsx');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();
const bucket = storage.bucket('hackops-gitam.appspot.com'); // Default Firebase Storage bucket

const mailgun = Mailgun({
  apiKey: '7d6e62760fd5ce741c2f83a623efd94c-e298dd8e-72d43344',
  domain: 'hackopsgitam.live',
});

exports.register = functions.https.onCall(async (data, context) => {
  try {
    const { eventId, name, email, phone, year, discipline, program } = data;

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(`Registration for Event ${eventId}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nYear: ${year}\nDiscipline: ${discipline}\nProgram: ${program}`, { x: 50, y: 700 });
    const pdfBytes = await pdfDoc.save();

    // Send Email
    const emailData = {
      from: 'HackOps Club <no-reply@hackopsgitam.live>',
      to: email,
      subject: 'Registration Confirmation',
      text: 'Thank you for registering! Attached is your confirmation.',
      attachment: { data: Buffer.from(pdfBytes), filename: 'registration_confirmation.pdf' },
    };
    await mailgun.messages().send(emailData);

    // Store in Firestore
    const registrationRef = db.collection('registrations').doc(`${eventId}_${Date.now()}`);
    await registrationRef.set({ eventId, name, email, phone, year, discipline, program, timestamp: admin.firestore.FieldValue.serverTimestamp() });

    // Update Excel in Storage
    const fileName = `registrations/event_${eventId}.xlsx`;
    let workbook;
    try {
      const file = bucket.file(fileName);
      const [contents] = await file.download();
      workbook = XLSX.read(contents, { type: 'buffer' });
    } catch (e) {
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([]), 'Registrations');
    }
    const worksheet = workbook.Sheets['Registrations'];
    const newRow = { name, email, phone, year, discipline, program, timestamp: new Date().toISOString() };
    XLSX.utils.sheet_add_json(worksheet, [newRow], { skipHeader: false, origin: -1 });
    const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    await bucket.file(fileName).save(xlsxBuffer);

    // Get participant count
    const snapshot = await db.collection('registrations').where('eventId', '==', eventId).get();
    const participantCount = snapshot.size;

    return { message: 'Registration successful', participantCount };
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('internal', 'Registration failed', error.message);
  }
});