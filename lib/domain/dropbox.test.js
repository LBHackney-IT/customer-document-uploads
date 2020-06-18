const { Dropbox, Customer } = require('./dropbox');

describe('domain/Dropbox', () => {
  describe('.empty()', () => {
    it('gives the dropbox a unique id', () => {
      const dropbox = Dropbox.empty();
      expect(dropbox.id).not.toBeUndefined();
      expect(dropbox.id).toStrictEqual(expect.any(String));
      expect(dropbox.id.length).toBe(20);
    });

    it('creates an unassigned, unsubmitted dropbox', () => {
      const dropbox = Dropbox.empty();

      expect(dropbox).toBeInstanceOf(Dropbox);
      expect(dropbox.customer).toBeNull();
      expect(dropbox.isSubmitted).toBe(false);
      expect(dropbox.submitted).toBeNull();
    });
  });

  describe('assign', () => {
    let dropbox;

    const customer = new Customer({
      name: 'Tess Ting',
      phone: '078941234565',
      email: 'tess@example.com',
      reference: 'abc',
      dob: '1991-09-09',
      nationalInsurance: 'AB111111C'
    });

    beforeEach(() => {
      dropbox = Dropbox.empty();
    });

    it('assigns a customer to the dropbox', () => {
      dropbox.assign(customer);
      expect(dropbox.customer).toBe(customer);
    });

    it('marks the dropbox as submitted', () => {
      dropbox.assign(customer);
      expect(dropbox.isSubmitted).toBe(true);
    });
  });
});
