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

      {/* AI Feature - HIGHLIGHTED */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-amber-100 border-y-4 border-amber-400">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-amber-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
              🤖 AI-POWERED SELLING
            </div>
            <h2 className="text-4xl font-bold text-amber-800 mb-4">
              The Future of Selling is Here
            </h2>
            <p className="text-xl text-amber-700 mb-6">
              Our AI works 24/7 to find trending products and automatically add them to your store.
              Never miss a sales opportunity again!
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-5xl mb-3">🤖</div>
                <h3 className="font-bold text-amber-800">24/7 Automation</h3>
                <p className="text-gray-600 text-sm">AI works around the clock finding new products</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-400">
                <div className="text-5xl mb-3">📊</div>
                <h3 className="font-bold text-amber-800">Smart Recommendations</h3>
                <p className="text-gray-600 text-sm">AI analyzes trends and suggests hot products</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-5xl mb-3">📱</div>
                <h3 className="font-bold text-amber-800">Auto-Social Sharing</h3>
                <p className="text-gray-600 text-sm">Automatically share new products to social media</p>
              </div>
            </div>
            <div className="mt-8">
              <span className="bg-amber-600 text-white px-8 py-3 rounded-full text-lg font-bold">
                🌟 Only on Unlimited Plan
              </span>
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

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-800 to-green-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">YOU ARE INVITED!</h2>
          <p className="text-xl mb-8">TOGETHER, LET'S BUILD ZIMBABWE'S DIGITAL WHOLESALE ECONOMY</p>
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
