import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { LegalDocumentContent } from './legalDocuments';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2933',
    lineHeight: 1.5
  },
  eyebrow: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 20
  },
  section: {
    marginBottom: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8
  },
  paragraph: {
    marginBottom: 6
  },
  item: {
    marginBottom: 5
  }
});

function LegalPdfDocument({ content }: { content: LegalDocumentContent }) {
  return (
    <Document title={content.title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>{content.updatedAt}</Text>
        <Text style={styles.eyebrow}>{content.version}</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>

        {content.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body?.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
            {section.items?.map((item) => (
              <Text key={item} style={styles.item}>
                • {item}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function createLegalDocumentPdfBlob(content: LegalDocumentContent) {
  return pdf(<LegalPdfDocument content={content} />).toBlob();
}
