USE vetcare_v2;
SET @existing_records = (SELECT COUNT(*) FROM `user`);
INSERT INTO vetcare_v2.`user` (user_id,full_name,email,password,role,is_active,created_at) SELECT user_id,full_name,email,password,role,is_active,created_at FROM vetcare.`users`;
INSERT INTO vetcare_v2.`pet` (pet_id,owner_id,name,species,breed,birth_date,created_at) SELECT pet_id,owner_id,name,species,breed,birth_date,created_at FROM vetcare.`pets`;
INSERT INTO vetcare_v2.`service` (service_id,name,description,veterinarian_name,duration_minutes,price,is_active) SELECT service_id,name,description,veterinarian_name,duration_minutes,price,is_active FROM vetcare.`services`;
INSERT INTO vetcare_v2.`appointment` (appointment_id,pet_id,service_id,veterinarian_name,scheduled_at,duration_minutes,agreed_price,status,created_at) SELECT appointment_id,pet_id,service_id,veterinarian_name,scheduled_at,duration_minutes,agreed_price,status,created_at FROM vetcare.`appointments`;
INSERT INTO vetcare_v2.review (review_id,appointment_id,rating,comment,pet_comfort_level,created_at,tags)
SELECT reviews.review_id,reviews.appointment_id,reviews.rating,reviews.comment,reviews.pet_comfort_level,reviews.created_at,
COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT('tagId',review_tags.tag_id,'name',review_tags.name))
FROM vetcare.review_tag_assignments AS assignment JOIN vetcare.review_tags AS review_tags ON assignment.tag_id=review_tags.tag_id
WHERE assignment.review_id=reviews.review_id),JSON_ARRAY())
FROM vetcare.reviews AS reviews;
INSERT INTO vetcare_v2.medical_record (medical_record_id,pet_id,record_type,veterinarian_name,recorded_at,notes,details)
SELECT record.medical_record_id,record.pet_id,record.record_type,record.veterinarian_name,record.recorded_at,record.notes,
CASE record.record_type
WHEN 'vaccination' THEN JSON_OBJECT('vaccineName',vaccination.vaccine_name,'applicationDate',DATE_FORMAT(vaccination.application_date,'%Y-%m-%d'),'nextDoseDate',IF(vaccination.next_dose_date IS NULL,NULL,DATE_FORMAT(vaccination.next_dose_date,'%Y-%m-%d')))
WHEN 'treatment' THEN JSON_OBJECT('medicationName',treatment.medication_name,'dosage',treatment.dosage,'frequency',treatment.frequency,'durationDays',treatment.duration_days)
WHEN 'laboratory_test' THEN JSON_OBJECT('testName',laboratory_test.test_name,'resultValue',laboratory_test.result_value,'referenceMin',laboratory_test.reference_min,'referenceMax',laboratory_test.reference_max,'unit',laboratory_test.unit)
END
FROM vetcare.medical_records AS record
LEFT JOIN vetcare.vaccinations AS vaccination ON record.medical_record_id=vaccination.medical_record_id
LEFT JOIN vetcare.treatments AS treatment ON record.medical_record_id=treatment.medical_record_id
LEFT JOIN vetcare.laboratory_tests AS laboratory_test ON record.medical_record_id=laboratory_test.medical_record_id;
