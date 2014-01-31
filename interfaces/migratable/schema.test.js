var Waterline = require('waterline'),
    Model = require('./support/schema.fixture'),
    assert = require('assert');

describe('Migratable Interface', function() {

  /////////////////////////////////////////////////////
  // TEST SETUP
  ////////////////////////////////////////////////////

  var Document,
      waterline;

  before(function(done) {
    waterline = new Waterline();
    waterline.loadCollection(Model);

    Events.emit('fixture', Model);

    waterline.initialize({ adapters: { wl_tests: Adapter }, connections: Connections }, function(err, colls) {
      if(err) return done(err);
      Document = colls.collections.document;
      done();
    });
  });

  after(function(done) {
    waterline.teardown(done);
  });

  describe('Schema', function() {

    describe('primaryKey', function() {

      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should disable autoPK', function(done) {
        Document.describe(function (err, user) {
          assert(!user.id);
          done();
        });
      });

      it('should set attribute as primary key', function(done) {
        Document.describe(function (err, user) {
          assert(user.title.primaryKey === true);
          done();
        });
      });
    });

    describe('autoIncrement', function() {

      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should set autoIncrement on schema attribute', function(done) {
        Document.describe(function (err, user) {

          // Some databases like MySQL don't allow multiple autoIncrement values
          if(!user.number.autoIncrement) {
            console.log('Auto Increment was not set on the non primary-key attribute. If your ' +
              'database supports it you should look into this. Some databases like MySQL dont ' +
              'support multiple auto increment values');
            return done();
          }

          assert(user.number.autoIncrement === true);
          done();
        });
      });

      it('should increment an ID on insert', function(done) {
        Document.describe(function (err, user) {

          // Some databases like MySQL don't allow multiple autoIncrement values
          if(!user.number.autoIncrement) {
            console.log('Auto Increment was not set on the non primary-key attribute. If your ' +
              'database supports it you should look into this. Some databases like MySQL dont ' +
              'support multiple auto increment values');
            return done();
          }

          Document.create({ title: 'autoincrement 1' }, function(err, record) {
            assert(record.number === 1);
            Document.create({ title: 'autoincrement 2' }, function(err, record) {
              assert(record.number === 2);
              done();
            });
          });
        });
      });

      it('should not allow multiple records with the same PK', function(done) {
        Document.create({ title: '100' }, function(err, record) {
          assert(record.title === '100');
          Document.create({ title: '100' }, function(err, record) {
            assert(err);
            assert(!record);
            done();
          });
        });
      });

    });

    describe('uniqueness', function() {

      /////////////////////////////////////////////////////
      // TEST METHODS
      ////////////////////////////////////////////////////

      it('should set unique on schema attribute', function(done) {
        Document.describe(function (err, user) {
          assert(user.serialNumber.unique === true);
          done();
        });
      });

      it('should return an error if unique constraint fails', function(done) {
        Document.create({ title: 'uniqueConstraint 1', serialNumber: 'test' }, function(err, record) {
          assert(!err);
          assert(record.serialNumber === 'test');

          Document.create({ title: 'uniqueConstraint 2', serialNumber: 'test' }, function(err, record) {
            assert(!record);
            assert(err);
            done();
          });
        });
      });
    });

  });
});