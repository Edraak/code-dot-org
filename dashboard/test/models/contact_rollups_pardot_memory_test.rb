require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  test 'add_and_update_pardot_ids inserts new mappings' do
    ContactRollupsPardotMemory.delete_all

    new_mappings = [
      {email: "alex@rollups.com", pardot_id: 1},
      {email: "becky@rollups.com", pardot_id: 2}
    ]
    PardotV2.stubs(:retrieve_new_ids).returns(new_mappings)

    ContactRollupsPardotMemory.add_and_update_pardot_ids

    new_mappings.each do |mapping|
      refute_nil ContactRollupsPardotMemory.find_by(email: mapping[:email], pardot_id: mapping[:pardot_id])
    end
  end

  test 'add_and_update_pardot_ids updates existing mapping' do
    ContactRollupsPardotMemory.delete_all
    existing_record = create :contact_rollups_pardot_memory

    new_pardot_id = existing_record.pardot_id + 1
    PardotV2.stubs(:retrieve_new_ids).returns(
      [{email: existing_record.email, pardot_id: new_pardot_id}]
    )

    ContactRollupsPardotMemory.add_and_update_pardot_ids

    assert_equal new_pardot_id, ContactRollupsPardotMemory.find_by(email: existing_record.email)&.pardot_id
  end

  test 'create_new_pardot_contacts' do
    ContactRollupsPardotMemory.delete_all
    ContactRollupsProcessed.delete_all
    PardotV2.stubs(:submit_batch_request).returns([])

    # Sync 1 contact
    processed_contacts = []
    processed_contacts << (create :contact_rollups_processed)

    ContactRollupsPardotMemory.create_new_pardot_prospects
    assert_equal processed_contacts.length, ContactRollupsPardotMemory.count

    # Sync multiple contacts
    processed_contacts.concat(create_list(:contact_rollups_processed, 2))

    ContactRollupsPardotMemory.create_new_pardot_prospects
    assert_equal processed_contacts.length, ContactRollupsPardotMemory.count
    processed_contacts.each do |contact|
      refute_nil ContactRollupsPardotMemory.find_by(email: contact.email)
    end
  end

  test 'save_sync_results' do
    assert_equal 0, ContactRollupsPardotMemory.count

    submissions = [
      {email: 'invalid_email', id: nil, db_Opt_in: 'No'},
      {email: 'valid@domain.com', id: nil, db_Opt_in: 'Yes'},
    ]
    errors = [
      {prospect_index: 0, error_msg: PardotHelpers::ERROR_INVALID_EMAIL}
    ]
    submitted_time = Time.now

    ContactRollupsPardotMemory.save_sync_results submissions, errors, submitted_time

    refute_nil ContactRollupsPardotMemory.find_by(
      email: submissions.first[:email],
      data_rejected_reason: PardotHelpers::ERROR_INVALID_EMAIL,
      data_rejected_at: submitted_time
    )

    record = ContactRollupsPardotMemory.find_by(
      email: submissions.second[:email],
      data_synced_at: submitted_time
    )
    assert_equal({'db_Opt_in' => 'Yes'}, record&.data_synced)
  end

  test 'delete_pardot_prospects deletes itself after deleting from Pardot' do
    assert_equal 0, ContactRollupsPardotMemory.count
    PardotV2.stubs(:delete_prospects).returns([])
    create :contact_rollups_pardot_memory, email: 'hard_delete@me.com', delete_from_pardot: true

    ContactRollupsPardotMemory.delete_pardot_prospects

    assert_nil ContactRollupsPardotMemory.find_by(email: 'hard_delete@me.com')
  end

  test 'delete_pardot_prospects does not delete itself if deletion from Pardot fails' do
    assert_equal 0, ContactRollupsPardotMemory.count
    contact = create :contact_rollups_pardot_memory, email: 'hard_delete@me.com', delete_from_pardot: true
    PardotV2.stubs(:delete_prospects).returns([contact.pardot_id])

    ContactRollupsPardotMemory.delete_pardot_prospects

    refute_nil ContactRollupsPardotMemory.find_by(email: 'hard_delete@me.com')
  end

  test 'delete_pardot_prospects only deletes appropriate contacts if deletion from Pardot is partially completed' do
    assert_equal 0, ContactRollupsPardotMemory.count
    contacts = create_list :contact_rollups_pardot_memory, 5, delete_from_pardot: true

    # one contact was unable to be deleted
    pardot_id_failed = [contacts.first.pardot_id]
    pardot_ids_deleted = contacts.pluck(:pardot_id) - pardot_id_failed
    PardotV2.stubs(:delete_prospects).returns(pardot_id_failed)

    ContactRollupsPardotMemory.delete_pardot_prospects

    refute_nil ContactRollupsPardotMemory.find_by(pardot_id: contacts.first.pardot_id)
    assert_equal [], ContactRollupsPardotMemory.where(pardot_id: pardot_ids_deleted)
  end
end
