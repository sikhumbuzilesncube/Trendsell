import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">B2B MARKETPLACE</h1>
            <p className="text-xl mb-8">
              Suppliers list products at wholesale. Sellers start businesses with zero inventory.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup/supplier"
                className="bg-amber-500 hover:bg-amber-600 text-green-900 font-bold py-3 px-8 rounded-lg transition"
              >
                JOIN AS A SUPPLIER
              </Link>
              <Link
                href="/signup/seller"
                className="bg-amber-500 hover:bg-amber-600 text-green-900 font-bold py-3 px-8 rounded-lg transition"
              >
                JOIN AS A SELLER
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-green-800">SECURE</h3>
              <p className="text-sm text-gray-600">Escrow Payments</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-green-800">FAST</h3>
              <p className="text-sm text-gray-600">Same-day Dispatch</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🇿🇼</div>
              <h3 className="font-bold text-green-800">LOCAL</h3>
              <p className="text-sm text-gray-600">USD & ZIG Support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold text-green-800">SUPPORT</h3>
              <p className="text-sm text-gray-600">WhatsApp Helpline</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-900 mb-12">HOW IT WORKS</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-green-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-green-800 mb-4">For Suppliers</h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  List your wholesale products with pricing and stock levels
                </li>
                <li className="flex items-start">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  Sellers across Zimbabwe market your products to their customers
                </li>
                <li className="flex items-start">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  You ship bulk orders to Trendsell. We handle last-mile delivery
                </li>
                <li className="flex items-start">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  Get paid securely within 48 hours of delivery confirmation
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-amber-800 mb-4">For Sellers</h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  Browse thousands of wholesale products. Pick what you want to sell
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  Set your own retail price. Share product links on WhatsApp/Facebook
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  Customer pays Trendsell. We tell you + the supplier to fulfill
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  Your profit is paid out instantly. No inventory risk ever
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-2">TrendSell</h3>
              <p className="text-sm text-green-200">Zimbabwe's trusted B2B marketplace.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">COMPANY</h4>
              <ul className="space-y-1 text-sm text-green-200">
                <li>How it works</li>
                <li>About Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">LEGAL</h4>
              <ul className="space-y-1 text-sm text-green-200">
                <li>Terms and Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">CONTACT</h4>
              <ul className="space-y-1 text-sm text-green-200">
                <li>info@trendsell.co.zw</li>
                <li>WhatsApp: +263 777 803 517</li>
                <li>Call: +263 777 803 517</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
                }
