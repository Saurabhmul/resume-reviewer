const { jsPDF } = require("jspdf");

const doc = new jsPDF();
doc.setFontSize(22);
doc.text("SAURABH AGGARWAL", 20, 20);
doc.setFontSize(10);
doc.text("saurabhmul@gmail.com | +91 8954889999", 20, 30);
doc.text("Professional Summary", 20, 45);
doc.text("11+ years in product management and Scaled consumer products.", 20, 55);
doc.text("Professional Experience", 20, 65);
doc.text("Senior Product Manager | Swiggy", 20, 75);
doc.text("Led the end-to-end launch of the Swiggy Diners program.", 25, 85);
doc.text("Owned the product roadmap for 2022-23.", 25, 95);

doc.save("test_resume.pdf");
