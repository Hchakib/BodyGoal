export function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Updates'],
    Company: ['About', 'Blog', 'Careers'],
    Support: ['Help Center', 'Contact', 'Status'],
  };

  return (
    <footer className="border-t border-[#151923] mt-24">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-6 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-4">
              <h4 className="mb-4 text-[#FFFFFF]">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-[#151923]">
          <p className="text-[#FFFFFF]/60 text-center">
            © 2025 BodyGoal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
