import CompatibilityCalculator from './CompatibilityCalculator.jsx';

export default function Match({
  heading = 'Cocokkan pendonor dengan permintaan',
  subheading = 'Pilih golongan darah pasien. SADA menampilkan pendonor yang kompatibel, bukan hanya yang golongannya sama, lalu menandai siapa yang sudah boleh donor lagi.',
}) {
  return (
    <section className="match" id="cocok">
      <div className="wrap">
        <CompatibilityCalculator heading={heading} subheading={subheading} />
      </div>
    </section>
  );
}
