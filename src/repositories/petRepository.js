
const database = require('../config/database');

async function createPet(ownerId, pet) {
  const [result] = await database.execute(
    `INSERT INTO pet
      (owner_id, name, species, breed, birth_date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      ownerId,
      pet.name,
      pet.species,
      pet.breed,
      pet.birthDate
    ]
  );

  return result.insertId;
}

async function findPetsByOwner(ownerId) {
  const [rows] = await database.execute(
    `SELECT
       pet_id AS petId,
       owner_id AS ownerId,
       name,
       species,
       breed,
       birth_date AS birthDate
     FROM pet
     WHERE owner_id = ?
     ORDER BY pet_id DESC`,
    [ownerId]
  );

  return rows;
}

async function findPets(search) {
  const pattern = `%${search}%`;

  const [rows] = await database.execute(
    `SELECT
       p.pet_id AS petId,
       p.name AS petName,
       p.species,
       p.breed,
       p.birth_date AS birthDate,
       p.owner_id AS ownerId,
       u.full_name AS ownerName,
       u.email AS ownerEmail
     FROM pet p
     INNER JOIN user u
       ON p.owner_id = u.user_id
     WHERE p.name LIKE ?
        OR p.species LIKE ?
        OR u.full_name LIKE ?
        OR u.email LIKE ?
     ORDER BY p.pet_id DESC`,
    [pattern, pattern, pattern, pattern]
  );

  return rows;
}

async function findPetById(petId) {
  const [rows] = await database.execute(
    `SELECT
       pet_id AS petId,
       owner_id AS ownerId,
       name AS petName,
       species,
       breed,
       birth_date AS birthDate
     FROM pet
     WHERE pet_id = ?`,
    [petId]
  );

  return rows[0] || null;
}

async function updatePet(petId, data) {
  const [result] = await database.execute(
    `UPDATE pet
     SET name = ?,
         species = ?,
         breed = ?,
         birth_date = ?
     WHERE pet_id = ?`,
    [
      data.petName,
      data.species,
      data.breed,
      data.birthDate,
      petId
    ]
  );

  return result.affectedRows;
}

module.exports = {
  createPet,
  findPetsByOwner,
  findPets,
  findPetById,
  updatePet
};
