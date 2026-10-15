SELECT 'user' AS resource, (SELECT COUNT(*) FROM vetcare.users) AS old_count, (SELECT COUNT(*) FROM vetcare_v2.`user`) AS new_count
UNION ALL SELECT 'pet', (SELECT COUNT(*) FROM vetcare.pets), (SELECT COUNT(*) FROM vetcare_v2.pet)
UNION ALL SELECT 'service', (SELECT COUNT(*) FROM vetcare.services), (SELECT COUNT(*) FROM vetcare_v2.service)
UNION ALL SELECT 'appointment', (SELECT COUNT(*) FROM vetcare.appointments), (SELECT COUNT(*) FROM vetcare_v2.appointment)
UNION ALL SELECT 'review', (SELECT COUNT(*) FROM vetcare.reviews), (SELECT COUNT(*) FROM vetcare_v2.review)
UNION ALL SELECT 'medical_record', (SELECT COUNT(*) FROM vetcare.medical_records), (SELECT COUNT(*) FROM vetcare_v2.medical_record);
